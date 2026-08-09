import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intake } from '../../entities/intake.entity';
import { Region } from '../../entities/region.entity';
import { Visit } from '../../entities/visit.entity';
import { CurrentUser } from '../intakes/intake.service';

const PROVINCE_CODE_MAP: Record<string, string> = {
  '北京市': '110000', '天津市': '120000', '河北省': '130000', '山西省': '140000',
  '内蒙古自治区': '150000', '辽宁省': '210000', '吉林省': '220000', '黑龙江省': '230000',
  '上海市': '310000', '江苏省': '320000', '浙江省': '330000', '安徽省': '340000',
  '福建省': '350000', '江西省': '360000', '山东省': '370000', '河南省': '410000',
  '湖北省': '420000', '湖南省': '430000', '广东省': '440000', '广西壮族自治区': '450000',
  '海南省': '460000', '重庆市': '500000', '四川省': '510000', '贵州省': '520000',
  '云南省': '530000', '西藏自治区': '540000', '陕西省': '610000', '甘肃省': '620000',
  '青海省': '630000', '宁夏回族自治区': '640000', '新疆维吾尔自治区': '650000',
  '台湾省': '710000', '香港特别行政区': '810000', '澳门特别行政区': '820000',
};

@Injectable()
export class BiService {
  constructor(
    @InjectRepository(Intake)
    private readonly intakeRepo: Repository<Intake>,
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
  ) {}

  private getUserDataScope(user: CurrentUser): string {
    if (!user.roles || user.roles.length === 0) return 'self';
    const roleDataScopes = user.roles.map((r) => r.dataScope);
    if (roleDataScopes.includes('all')) return 'all';
    if (roleDataScopes.includes('region')) return 'region';
    if (roleDataScopes.includes('team')) return 'team';
    return 'self';
  }

  private getUserRoleCodes(user: CurrentUser): string[] {
    return user.roles?.map((r) => r.code) || [];
  }

  private applyDataScopeFilter(
    qb: ReturnType<Repository<Intake>['createQueryBuilder']>,
    alias: string,
    user: CurrentUser,
  ): void {
    const scope = this.getUserDataScope(user);
    const roleCodes = this.getUserRoleCodes(user);

    if (roleCodes.includes('middleware_ops') || roleCodes.includes('admin')) {
      return;
    }

    switch (scope) {
      case 'all':
        return;
      case 'region':
        if (user.regionId) {
          qb.andWhere(`${alias}.applicationRegionId = :regionId`, { regionId: user.regionId });
        }
        return;
      case 'team':
        qb.andWhere(
          `${alias}.applicantId IN (SELECT u.id FROM users u WHERE u.regionId = :regionId)`,
          { regionId: user.regionId || 0 },
        );
        return;
      case 'self':
      default:
        qb.andWhere(`${alias}.applicantId = :userId`, { userId: user.id });
        return;
    }
  }

  private applyVisitScopeFilter(
    qb: ReturnType<Repository<Visit>['createQueryBuilder']>,
    alias: string,
    user: CurrentUser,
  ): void {
    const scope = this.getUserDataScope(user);
    const roleCodes = this.getUserRoleCodes(user);

    if (roleCodes.includes('middleware_ops') || roleCodes.includes('admin')) {
      return;
    }

    switch (scope) {
      case 'all':
        return;
      case 'region':
        if (user.regionId) {
          qb.andWhere(`${alias}.applicationRegionId = :regionId`, { regionId: user.regionId });
        }
        return;
      case 'team':
        qb.andWhere(
          `${alias}.operatorId IN (SELECT u.id FROM users u WHERE u.regionId = :regionId)`,
          { regionId: user.regionId || 0 },
        );
        return;
      case 'self':
      default:
        qb.andWhere(`${alias}.operatorId = :userId`, { userId: user.id });
        return;
    }
  }

  async getMapData(currentUser: CurrentUser) {
    const regions = await this.regionRepo.find();
    const provinceRegions = regions.filter((r) => r.level === 1);
    const provinceNameToId = new Map(provinceRegions.map((r) => [r.name, r.id]));

    const regionsById = new Map(regions.map((r) => [r.id, r]));

    const qb = this.intakeRepo.createQueryBuilder('i');
    this.applyDataScopeFilter(qb, 'i', currentUser);
    qb.andWhere('i.applicationRegionId IS NOT NULL');
    const intakes = await qb.getMany();

    const provinceAgg = new Map<number, { enterpriseCount: number; totalArea: number; landedCount: number }>();
    for (const intake of intakes) {
      let rid: number | null | undefined = intake.applicationRegionId;
      let region = rid ? regionsById.get(rid) : undefined;
      if (region && region.level === 2) {
        rid = region.parentId;
      }
      if (!rid) continue;

      const agg = provinceAgg.get(rid) || { enterpriseCount: 0, totalArea: 0, landedCount: 0 };
      agg.enterpriseCount++;
      if (intake.area) agg.totalArea += Number(intake.area);
      if (intake.status === 'landed') agg.landedCount++;
      provinceAgg.set(rid, agg);
    }

    const provinces = provinceRegions.map((p) => {
      const agg = provinceAgg.get(p.id) || { enterpriseCount: 0, totalArea: 0, landedCount: 0 };
      return {
        name: p.name,
        code: PROVINCE_CODE_MAP[p.name] || `${p.id}`,
        enterpriseCount: agg.enterpriseCount,
        totalArea: Math.round(agg.totalArea),
        landedCount: agg.landedCount,
      };
    });

    const totals = {
      totalEnterprises: intakes.length,
      totalArea: Math.round(intakes.reduce((sum, i) => sum + (Number(i.area) || 0), 0)),
      totalLanded: intakes.filter((i) => i.status === 'landed').length,
      conversionRate: intakes.length > 0
        ? Number(((intakes.filter((i) => i.status === 'landed').length / intakes.length) * 100).toFixed(2))
        : 0,
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentQB = this.intakeRepo.createQueryBuilder('i');
    this.applyDataScopeFilter(recentQB, 'i', currentUser);
    recentQB.andWhere('i.createdAt >= :since', { since: thirtyDaysAgo });
    const recentCreated = await recentQB.getCount();

    const approvedQB = this.intakeRepo.createQueryBuilder('i');
    this.applyDataScopeFilter(approvedQB, 'i', currentUser);
    approvedQB.andWhere('i.updatedAt >= :since', { since: thirtyDaysAgo });
    approvedQB.andWhere('i.status = :status', { status: 'landed' });
    const recentApproved = await approvedQB.getCount();

    const visitQB = this.visitRepo.createQueryBuilder('v');
    this.applyVisitScopeFilter(visitQB, 'v', currentUser);
    visitQB.andWhere('v.createdAt >= :since', { since: thirtyDaysAgo });
    const recentVisited = await visitQB.getCount();

    return {
      provinces,
      totals,
      recent30days: {
        created: recentCreated,
        approved: recentApproved,
        visited: recentVisited,
      },
    };
  }

  async getCityData(provinceCode: string, currentUser: CurrentUser) {
    const provinceName = Object.keys(PROVINCE_CODE_MAP).find(
      (k) => PROVINCE_CODE_MAP[k] === provinceCode,
    );
    if (!provinceName) {
      return { cities: [], provinceName: '' };
    }

    const provinceRegion = await this.regionRepo.findOne({ where: { name: provinceName, level: 1 } });
    if (!provinceRegion) {
      return { cities: [], provinceName };
    }

    const cities = await this.regionRepo.find({ where: { parentId: provinceRegion.id, level: 2 } });

    const qb = this.intakeRepo.createQueryBuilder('i');
    this.applyDataScopeFilter(qb, 'i', currentUser);
    const intakes = await qb.getMany();

    const cityAgg = new Map<number, { enterpriseCount: number; totalArea: number; landedCount: number }>();
    for (const intake of intakes) {
      if (!intake.applicationRegionId) continue;
      if (intake.applicationRegionId === provinceRegion.id) continue;
      const cityRegion = await this.regionRepo.findOne({ where: { id: intake.applicationRegionId } });
      if (!cityRegion || cityRegion.parentId !== provinceRegion.id) continue;

      const agg = cityAgg.get(cityRegion.id) || { enterpriseCount: 0, totalArea: 0, landedCount: 0 };
      agg.enterpriseCount++;
      if (intake.area) agg.totalArea += Number(intake.area);
      if (intake.status === 'landed') agg.landedCount++;
      cityAgg.set(cityRegion.id, agg);
    }

    const cityNamesSet = new Set(intakes
      .filter((i) => i.applicationRegionId && i.applicationRegionId !== provinceRegion.id)
      .map((i) => i.applicationRegionId));

    const cityIntakes = await Promise.all([...cityNamesSet].map(async (rid) => {
      const region = await this.regionRepo.findOne({ where: { id: rid } });
      return region;
    }));

    const cityRegionIds = new Set(cityIntakes.filter(Boolean).map((r) => r!.id));
    cityAgg.forEach((_v, k) => cityRegionIds.add(k));

    const result = cities.map((c) => {
      const agg = cityAgg.get(c.id) || { enterpriseCount: 0, totalArea: 0, landedCount: 0 };
      return {
        name: c.name,
        code: `${c.id}`,
        enterpriseCount: agg.enterpriseCount,
        totalArea: Math.round(agg.totalArea),
        landedCount: agg.landedCount,
      };
    });

    return {
      cities: result.filter((c) => c.enterpriseCount > 0),
      provinceName,
    };
  }

  async getStatusDistribution(currentUser: CurrentUser) {
    const qb = this.intakeRepo.createQueryBuilder('i');
    this.applyDataScopeFilter(qb, 'i', currentUser);
    const intakes = await qb.getMany();

    const statusMap: Record<string, string> = {
      pending: '待审核',
      rejected: '已驳回',
      approved: '已通过',
      assigned: '已分配',
      following: '跟进中',
      landed: '已落地',
      lost: '已流失',
    };

    const counts = new Map<string, number>();
    for (const i of intakes) {
      const label = statusMap[i.status] || i.status;
      counts.set(label, (counts.get(label) || 0) + 1);
    }

    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }

  async getTrendData(currentUser: CurrentUser, days = 30) {
    const dates: string[] = [];
    const createdArr: number[] = [];
    const landedArr: number[] = [];

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dates.push(key);
      createdArr.push(0);
      landedArr.push(0);
    }

    const qb = this.intakeRepo.createQueryBuilder('i');
    this.applyDataScopeFilter(qb, 'i', currentUser);
    qb.andWhere('i.createdAt >= :start', { start: startDate });
    const all = await qb.getMany();

    for (const intake of all) {
      const d = intake.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const idx = dates.indexOf(key);
      if (idx >= 0) createdArr[idx]++;
    }

    const landedQB = this.intakeRepo.createQueryBuilder('i');
    this.applyDataScopeFilter(landedQB, 'i', currentUser);
    landedQB.andWhere('i.updatedAt >= :start', { start: startDate });
    landedQB.andWhere('i.status = :status', { status: 'landed' });
    const landed = await landedQB.getMany();

    for (const intake of landed) {
      const d = intake.updatedAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const idx = dates.indexOf(key);
      if (idx >= 0) landedArr[idx]++;
    }

    return { dates, created: createdArr, landed: landedArr };
  }

  async getIndustryDistribution(currentUser: CurrentUser) {
    const qb = this.intakeRepo.createQueryBuilder('i');
    this.applyDataScopeFilter(qb, 'i', currentUser);
    qb.andWhere("i.industry IS NOT NULL AND i.industry != ''");
    const intakes = await qb.getMany();

    const counts = new Map<string, number>();
    for (const i of intakes) {
      const industry = i.industry || '未知';
      counts.set(industry, (counts.get(industry) || 0) + 1);
    }

    const arr = Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return arr;
  }

  async getSummary(currentUser: CurrentUser) {
    const qb = this.intakeRepo.createQueryBuilder('i');
    this.applyDataScopeFilter(qb, 'i', currentUser);
    const intakes = await qb.getMany();

    const totalEnterprises = intakes.length;
    const totalArea = Math.round(intakes.reduce((sum, i) => sum + (Number(i.area) || 0), 0));
    const landedCount = intakes.filter((i) => i.status === 'landed').length;
    const conversionRate = totalEnterprises > 0
      ? Number(((landedCount / totalEnterprises) * 100).toFixed(2))
      : 0;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentQB = this.intakeRepo.createQueryBuilder('i');
    this.applyDataScopeFilter(recentQB, 'i', currentUser);
    recentQB.andWhere('i.createdAt >= :since', { since: sevenDaysAgo });
    const weekNewIntakes = await recentQB.getCount();

    const pendingCount = intakes.filter((i) => i.status === 'pending' || i.status === 'assigned' || i.status === 'following').length;

    return {
      totalEnterprises,
      totalArea,
      landedCount,
      conversionRate,
      pendingCount,
      weekNewIntakes,
    };
  }
}
