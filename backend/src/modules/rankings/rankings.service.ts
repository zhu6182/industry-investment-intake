import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from '../../entities/referral.entity';

export interface RankItem {
  userId: number;
  userName: string;
  count: number;
  totalArea: number;
}

export interface MyRankResult {
  byCount: {
    rank: number | null;
    total: number;
    me: RankItem;
  };
  byArea: {
    rank: number | null;
    total: number;
    me: RankItem;
  };
}

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(Referral)
    private referralRepo: Repository<Referral>,
  ) {}

  async rankByCount(limit = 50): Promise<RankItem[]> {
    const rows = await this.referralRepo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.referrer', 'u')
      .select('u.id', 'userId')
      .addSelect('u.name', 'userName')
      .addSelect('COUNT(r.id)', 'count')
      .groupBy('r.referrerId')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r: any) => ({
      userId: Number(r.userId),
      userName: r.userName,
      count: Number(r.count),
      totalArea: 0,
    }));
  }

  async rankByArea(limit = 50): Promise<RankItem[]> {
    const rows = await this.referralRepo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.referrer', 'u')
      .innerJoin('r.intake', 'i')
      .where('i.status = :status', { status: 'landed' })
      .select('u.id', 'userId')
      .addSelect('u.name', 'userName')
      .addSelect('COUNT(r.id)', 'count')
      .addSelect('COALESCE(SUM(i.area), 0)', 'totalArea')
      .groupBy('r.referrerId')
      .orderBy('totalArea', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r: any) => ({
      userId: Number(r.userId),
      userName: r.userName,
      count: Number(r.count),
      totalArea: Number(r.totalArea),
    }));
  }

  async getMyRank(userId: number): Promise<MyRankResult> {
    const byCount = await this.rankByCount(1000);
    const byArea = await this.rankByArea(1000);

    const countRank = byCount.findIndex((r) => r.userId === userId);
    const areaRank = byArea.findIndex((r) => r.userId === userId);

    const myCount = byCount[countRank];
    const myArea = byArea[areaRank];

    return {
      byCount: {
        rank: countRank === -1 ? null : countRank + 1,
        total: byCount.length,
        me: myCount || { userId, userName: '', count: 0, totalArea: 0 },
      },
      byArea: {
        rank: areaRank === -1 ? null : areaRank + 1,
        total: byArea.length,
        me: myArea || { userId, userName: '', count: 0, totalArea: 0 },
      },
    };
  }
}
