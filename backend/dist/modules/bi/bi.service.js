"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const intake_entity_1 = require("../../entities/intake.entity");
const region_entity_1 = require("../../entities/region.entity");
const visit_entity_1 = require("../../entities/visit.entity");
const PROVINCE_CODE_MAP = {
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
const STATUS_LABEL_MAP = {
    pending: '待审核',
    rejected: '已驳回',
    approved: '已通过',
    assigned: '已分配',
    following: '跟进中',
    landed: '已落地',
    lost: '已流失',
};
let BiService = class BiService {
    intakeRepo;
    regionRepo;
    visitRepo;
    constructor(intakeRepo, regionRepo, visitRepo) {
        this.intakeRepo = intakeRepo;
        this.regionRepo = regionRepo;
        this.visitRepo = visitRepo;
    }
    getUserDataScope(user) {
        if (!user.roles || user.roles.length === 0)
            return 'self';
        const roleDataScopes = user.roles.map((r) => r.dataScope);
        if (roleDataScopes.includes('all'))
            return 'all';
        if (roleDataScopes.includes('region'))
            return 'region';
        if (roleDataScopes.includes('team'))
            return 'team';
        return 'self';
    }
    getUserRoleCodes(user) {
        return user.roles?.map((r) => r.code) || [];
    }
    applyDataScopeFilter(qb, alias, user) {
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
                qb.andWhere(`${alias}.applicantId IN (SELECT u.id FROM users u WHERE u.regionId = :regionId)`, { regionId: user.regionId || 0 });
                return;
            case 'self':
            default:
                qb.andWhere(`${alias}.applicantId = :userId`, { userId: user.id });
                return;
        }
    }
    applyVisitScopeFilter(qb, alias, user) {
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
                qb.andWhere(`${alias}.operatorId IN (SELECT u.id FROM users u WHERE u.regionId = :regionId)`, { regionId: user.regionId || 0 });
                return;
            case 'self':
            default:
                qb.andWhere(`${alias}.operatorId = :userId`, { userId: user.id });
                return;
        }
    }
    async getAllBiData(currentUser) {
        const allRegions = await this.regionRepo.find();
        const regionMap = new Map(allRegions.map((r) => [r.id, r]));
        const provinceRegions = allRegions.filter((r) => r.level === 1);
        const baseQB = () => {
            const qb = this.intakeRepo.createQueryBuilder('i');
            this.applyDataScopeFilter(qb, 'i', currentUser);
            return qb;
        };
        const totals = await baseQB()
            .select('COUNT(*)', 'totalEnterprises')
            .addSelect('COALESCE(SUM(CASE WHEN i.area IS NOT NULL THEN i.area ELSE 0 END), 0)', 'totalArea')
            .addSelect("SUM(CASE WHEN i.status = 'landed' THEN 1 ELSE 0 END)", 'totalLanded')
            .getRawOne();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentStats = await baseQB()
            .select('SUM(CASE WHEN i.createdAt >= :d30 THEN 1 ELSE 0 END)', 'recentCreated')
            .addSelect("SUM(CASE WHEN i.updatedAt >= :d30 AND i.status = 'landed' THEN 1 ELSE 0 END)", 'recentLanded')
            .addSelect('SUM(CASE WHEN i.createdAt >= :d7 THEN 1 ELSE 0 END)', 'weekNewIntakes')
            .setParameter('d30', thirtyDaysAgo)
            .setParameter('d7', sevenDaysAgo)
            .getRawOne();
        const statusRows = await baseQB()
            .select('i.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('i.status')
            .getRawMany();
        const statusDistribution = statusRows.map((row) => ({
            name: STATUS_LABEL_MAP[row.status] || row.status,
            value: Number(row.count),
        }));
        const industryRows = await baseQB()
            .select('i.industry', 'industry')
            .addSelect('COUNT(*)', 'count')
            .andWhere("i.industry IS NOT NULL AND i.industry != ''")
            .groupBy('i.industry')
            .orderBy('count', 'DESC')
            .getRawMany();
        const industryDistribution = industryRows.map((row) => ({
            name: row.industry || '未知',
            value: Number(row.count),
        }));
        const regionRows = await baseQB()
            .select('i.applicationRegionId', 'regionId')
            .addSelect('COUNT(*)', 'enterpriseCount')
            .addSelect('COALESCE(SUM(i.area), 0)', 'totalArea')
            .addSelect("SUM(CASE WHEN i.status = 'landed' THEN 1 ELSE 0 END)", 'landedCount')
            .andWhere('i.applicationRegionId IS NOT NULL')
            .groupBy('i.applicationRegionId')
            .getRawMany();
        const provinceAgg = new Map();
        for (const row of regionRows) {
            const rid = Number(row.regionId);
            const region = regionMap.get(rid);
            if (!region)
                continue;
            let provinceId = null;
            if (region.level === 1) {
                provinceId = region.id;
            }
            else if (region.level === 2 && region.parentId) {
                provinceId = region.parentId;
            }
            if (!provinceId)
                continue;
            const agg = provinceAgg.get(provinceId) || { enterpriseCount: 0, totalArea: 0, landedCount: 0 };
            agg.enterpriseCount += Number(row.enterpriseCount);
            agg.totalArea += Number(row.totalArea);
            agg.landedCount += Number(row.landedCount);
            provinceAgg.set(provinceId, agg);
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
        const days = 30;
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);
        const dateKeys = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            dateKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
        }
        const createdByDate = new Map();
        const landedByDate = new Map();
        const createdRows = await baseQB()
            .select("DATE(i.createdAt)", 'date')
            .addSelect('COUNT(*)', 'count')
            .andWhere('i.createdAt >= :start', { start: startDate })
            .groupBy('DATE(i.createdAt)')
            .getRawMany();
        for (const row of createdRows) {
            createdByDate.set(row.date, Number(row.count));
        }
        const landedRows = await baseQB()
            .select("DATE(i.updatedAt)", 'date')
            .addSelect('COUNT(*)', 'count')
            .andWhere('i.updatedAt >= :start', { start: startDate })
            .andWhere("i.status = 'landed'")
            .groupBy('DATE(i.updatedAt)')
            .getRawMany();
        for (const row of landedRows) {
            landedByDate.set(row.date, Number(row.count));
        }
        const createdArr = dateKeys.map((k) => createdByDate.get(k) || 0);
        const landedArr = dateKeys.map((k) => landedByDate.get(k) || 0);
        const visitQB = this.visitRepo.createQueryBuilder('v');
        this.applyVisitScopeFilter(visitQB, 'v', currentUser);
        visitQB.andWhere('v.createdAt >= :since', { since: thirtyDaysAgo });
        const recentVisits = await visitQB.getCount();
        const totalEnterprises = Number(totals?.totalEnterprises || 0);
        const totalArea = Math.round(Number(totals?.totalArea || 0));
        const totalLanded = Number(totals?.totalLanded || 0);
        const conversionRate = totalEnterprises > 0
            ? Number(((totalLanded / totalEnterprises) * 100).toFixed(2))
            : 0;
        const weekNewIntakes = Number(recentStats?.weekNewIntakes || 0);
        const pendingCount = statusDistribution
            .filter((s) => ['待审核', '已分配', '跟进中'].includes(s.name))
            .reduce((sum, s) => sum + s.value, 0);
        return {
            provinces,
            totals: {
                totalEnterprises,
                totalArea,
                totalLanded,
                conversionRate,
            },
            recent30days: {
                created: Number(recentStats?.recentCreated || 0),
                approved: Number(recentStats?.recentLanded || 0),
                visited: recentVisits,
            },
            statusDistribution,
            trend: {
                dates: dateKeys,
                created: createdArr,
                landed: landedArr,
            },
            industryDistribution,
            summary: {
                totalEnterprises,
                totalArea,
                landedCount: totalLanded,
                conversionRate,
                pendingCount,
                weekNewIntakes,
            },
        };
    }
    async getMapData(currentUser) {
        const all = await this.getAllBiData(currentUser);
        return {
            provinces: all.provinces,
            totals: all.totals,
            recent30days: all.recent30days,
        };
    }
    async getCityData(provinceCode, currentUser) {
        const provinceName = Object.keys(PROVINCE_CODE_MAP).find((k) => PROVINCE_CODE_MAP[k] === provinceCode);
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
        qb.select('i.applicationRegionId', 'regionId')
            .addSelect('COUNT(*)', 'enterpriseCount')
            .addSelect('COALESCE(SUM(i.area), 0)', 'totalArea')
            .addSelect("SUM(CASE WHEN i.status = 'landed' THEN 1 ELSE 0 END)", 'landedCount')
            .andWhere('i.applicationRegionId IS NOT NULL')
            .groupBy('i.applicationRegionId');
        const rows = await qb.getRawMany();
        const cityIds = new Set(cities.map((c) => c.id));
        const cityAgg = new Map();
        for (const row of rows) {
            const rid = Number(row.regionId);
            if (!cityIds.has(rid))
                continue;
            cityAgg.set(rid, {
                enterpriseCount: Number(row.enterpriseCount),
                totalArea: Number(row.totalArea),
                landedCount: Number(row.landedCount),
            });
        }
        const result = cities
            .filter((c) => cityAgg.has(c.id))
            .map((c) => {
            const agg = cityAgg.get(c.id);
            return {
                name: c.name,
                code: `${c.id}`,
                enterpriseCount: agg.enterpriseCount,
                totalArea: Math.round(agg.totalArea),
                landedCount: agg.landedCount,
            };
        });
        return { cities: result, provinceName };
    }
    async getStatusDistribution(currentUser) {
        const all = await this.getAllBiData(currentUser);
        return all.statusDistribution;
    }
    async getTrendData(currentUser, days = 30) {
        const all = await this.getAllBiData(currentUser);
        if (days === 30) {
            return all.trend;
        }
        const trend = all.trend;
        if (days < 30) {
            const slice = 30 - days;
            return {
                dates: trend.dates.slice(slice),
                created: trend.created.slice(slice),
                landed: trend.landed.slice(slice),
            };
        }
        return trend;
    }
    async getIndustryDistribution(currentUser) {
        const all = await this.getAllBiData(currentUser);
        return all.industryDistribution;
    }
    async getSummary(currentUser) {
        const all = await this.getAllBiData(currentUser);
        return all.summary;
    }
};
exports.BiService = BiService;
exports.BiService = BiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(intake_entity_1.Intake)),
    __param(1, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __param(2, (0, typeorm_1.InjectRepository)(visit_entity_1.Visit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BiService);
//# sourceMappingURL=bi.service.js.map