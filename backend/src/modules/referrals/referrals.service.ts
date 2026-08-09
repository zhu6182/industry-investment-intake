import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from '../../entities/referral.entity';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referral)
    private referralRepo: Repository<Referral>,
  ) {}

  async createReferral(intakeId: number, referrerId: number, type: string = 'referrer'): Promise<Referral> {
    const existing = await this.referralRepo.findOne({
      where: { intakeId, referrerId },
    });
    if (existing) return existing;

    const ref = this.referralRepo.create({
      intakeId,
      referrerId,
      type: type as any,
    });
    return this.referralRepo.save(ref);
  }

  async findByReferrer(referrerId: number, page = 1, limit = 20) {
    const qb = this.referralRepo.createQueryBuilder('r');
    qb.leftJoinAndSelect('r.intake', 'intake');
    qb.leftJoinAndSelect('intake.applicant', 'applicant');
    qb.where('r.referrerId = :referrerId', { referrerId });
    qb.orderBy('r.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [list, total] = await qb.getManyAndCount();
    return { list, total, page, limit };
  }

  async getStats(referrerId: number) {
    const totalCount = await this.referralRepo.count({
      where: { referrerId },
    });

    const landedCount = await this.referralRepo
      .createQueryBuilder('r')
      .innerJoin('r.intake', 'i')
      .where('r.referrerId = :referrerId', { referrerId })
      .andWhere('i.status = :status', { status: 'landed' })
      .getCount();

    const result = await this.referralRepo
      .createQueryBuilder('r')
      .innerJoin('r.intake', 'i')
      .select('COALESCE(SUM(i.area), 0)', 'totalArea')
      .where('r.referrerId = :referrerId', { referrerId })
      .andWhere('i.status = :status', { status: 'landed' })
      .getRawOne();

    return {
      totalCount,
      landedCount,
      totalArea: Number(result?.totalArea || 0),
    };
  }

  async findAll(query: { page?: number; limit?: number; referrerId?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.referralRepo.createQueryBuilder('r');
    qb.leftJoinAndSelect('r.referrer', 'referrer');
    qb.leftJoinAndSelect('r.intake', 'intake');
    if (query.referrerId) {
      qb.where('r.referrerId = :referrerId', { referrerId: query.referrerId });
    }
    qb.orderBy('r.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [list, total] = await qb.getManyAndCount();
    return { list, total, page, limit };
  }
}
