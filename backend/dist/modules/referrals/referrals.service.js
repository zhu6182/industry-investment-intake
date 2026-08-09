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
exports.ReferralsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const referral_entity_1 = require("../../entities/referral.entity");
let ReferralsService = class ReferralsService {
    referralRepo;
    constructor(referralRepo) {
        this.referralRepo = referralRepo;
    }
    async createReferral(intakeId, referrerId, type = 'referrer') {
        const existing = await this.referralRepo.findOne({
            where: { intakeId, referrerId },
        });
        if (existing)
            return existing;
        const ref = this.referralRepo.create({
            intakeId,
            referrerId,
            type: type,
        });
        return this.referralRepo.save(ref);
    }
    async findByReferrer(referrerId, page = 1, limit = 20) {
        const qb = this.referralRepo.createQueryBuilder('r');
        qb.leftJoinAndSelect('r.intake', 'intake');
        qb.leftJoinAndSelect('intake.applicant', 'applicant');
        qb.where('r.referrerId = :referrerId', { referrerId });
        qb.orderBy('r.createdAt', 'DESC');
        qb.skip((page - 1) * limit).take(limit);
        const [list, total] = await qb.getManyAndCount();
        return { list, total, page, limit };
    }
    async getStats(referrerId) {
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
    async findAll(query) {
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
};
exports.ReferralsService = ReferralsService;
exports.ReferralsService = ReferralsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(referral_entity_1.Referral)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReferralsService);
//# sourceMappingURL=referrals.service.js.map