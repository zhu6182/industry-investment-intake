import { Repository } from 'typeorm';
import { Referral } from '../../entities/referral.entity';
export declare class ReferralsService {
    private referralRepo;
    constructor(referralRepo: Repository<Referral>);
    createReferral(intakeId: number, referrerId: number, type?: string): Promise<Referral>;
    findByReferrer(referrerId: number, page?: number, limit?: number): Promise<{
        list: Referral[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(referrerId: number): Promise<{
        totalCount: number;
        landedCount: number;
        totalArea: number;
    }>;
    findAll(query: {
        page?: number;
        limit?: number;
        referrerId?: number;
    }): Promise<{
        list: Referral[];
        total: number;
        page: number;
        limit: number;
    }>;
}
