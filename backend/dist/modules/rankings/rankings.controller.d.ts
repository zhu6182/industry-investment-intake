import { RankingsService } from './rankings.service';
export declare class RankingsController {
    private readonly rankingsService;
    constructor(rankingsService: RankingsService);
    rankByCount(limit?: string): Promise<import("./rankings.service").RankItem[]>;
    rankByArea(limit?: string): Promise<import("./rankings.service").RankItem[]>;
    getMyRank(req?: {
        user: any;
    }): Promise<import("./rankings.service").MyRankResult>;
}
