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
export declare class RankingsService {
    private referralRepo;
    constructor(referralRepo: Repository<Referral>);
    rankByCount(limit?: number): Promise<RankItem[]>;
    rankByArea(limit?: number): Promise<RankItem[]>;
    getMyRank(userId: number): Promise<MyRankResult>;
}
