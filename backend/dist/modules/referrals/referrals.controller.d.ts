import { ReferralsService } from './referrals.service';
export declare class ReferralsController {
    private readonly referralsService;
    constructor(referralsService: ReferralsService);
    findMine(page?: string, limit?: string, req?: {
        user: any;
    }): Promise<{
        list: import("../../entities/referral.entity").Referral[];
        total: number;
        page: number;
        limit: number;
    }>;
    getMyStats(req?: {
        user: any;
    }): Promise<{
        totalCount: number;
        landedCount: number;
        totalArea: number;
    }>;
    findAll(page?: string, limit?: string, referrerId?: string): Promise<{
        list: import("../../entities/referral.entity").Referral[];
        total: number;
        page: number;
        limit: number;
    }>;
}
