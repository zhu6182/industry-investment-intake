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
exports.RankingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const referral_entity_1 = require("../../entities/referral.entity");
let RankingsService = class RankingsService {
    referralRepo;
    constructor(referralRepo) {
        this.referralRepo = referralRepo;
    }
    async rankByCount(limit = 50) {
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
        return rows.map((r) => ({
            userId: Number(r.userId),
            userName: r.userName,
            count: Number(r.count),
            totalArea: 0,
        }));
    }
    async rankByArea(limit = 50) {
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
        return rows.map((r) => ({
            userId: Number(r.userId),
            userName: r.userName,
            count: Number(r.count),
            totalArea: Number(r.totalArea),
        }));
    }
    async getMyRank(userId) {
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
};
exports.RankingsService = RankingsService;
exports.RankingsService = RankingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(referral_entity_1.Referral)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RankingsService);
//# sourceMappingURL=rankings.service.js.map