import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { DuplicateCheckLog } from '../../entities/duplicate-check-log.entity';
import { QueryLogDto } from './dto/query-log.dto';

@Injectable()
export class DuplicateCheckLogsService {
  constructor(
    @InjectRepository(DuplicateCheckLog)
    private readonly repo: Repository<DuplicateCheckLog>,
  ) {}

  async query(params: QueryLogDto) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));

    const where: any = {};
    if (params.companyName) {
      where.companyName = Like(`%${params.companyName}%`);
    }
    if (params.checkerPhone) {
      where.checkerPhone = params.checkerPhone;
    }
    if (params.intakeStatus) {
      where.intakeStatus = params.intakeStatus;
    }
    if (params.startDate && params.endDate) {
      where.createdAt = Between(new Date(params.startDate), new Date(params.endDate));
    } else if (params.startDate) {
      where.createdAt = Between(new Date(params.startDate), new Date());
    } else if (params.endDate) {
      where.createdAt = Between(new Date('2000-01-01'), new Date(params.endDate));
    }

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const log = await this.repo.findOne({ where: { id } });
    if (!log) throw new NotFoundException(`DuplicateCheckLog #${id} not found`);
    return log;
  }

  async summary() {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const last30DaysCount = await this.repo
      .createQueryBuilder('l')
      .where('l.createdAt >= :since', { since })
      .getCount();

    const topDuplicatedRaw = await this.repo
      .createQueryBuilder('l')
      .select('l.companyName', 'companyName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('l.companyName')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const topCheckersRaw = await this.repo
      .createQueryBuilder('l')
      .select('l.checkerName', 'checkerName')
      .addSelect('l.checkerPhone', 'checkerPhone')
      .addSelect('COUNT(*)', 'count')
      .groupBy('l.checkerName')
      .addGroupBy('l.checkerPhone')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      last30DaysCount,
      topDuplicatedCompanies: topDuplicatedRaw.map((r) => ({
        companyName: r.companyName,
        count: Number(r.count),
      })),
      topCheckers: topCheckersRaw.map((r) => ({
        checkerName: r.checkerName,
        checkerPhone: r.checkerPhone,
        count: Number(r.count),
      })),
    };
  }
}
