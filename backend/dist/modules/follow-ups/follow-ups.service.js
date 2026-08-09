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
exports.FollowUpsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const follow_up_entity_1 = require("../../entities/follow-up.entity");
const intake_service_1 = require("../intakes/intake.service");
let FollowUpsService = class FollowUpsService {
    followUpRepo;
    intakeService;
    constructor(followUpRepo, intakeService) {
        this.followUpRepo = followUpRepo;
        this.intakeService = intakeService;
    }
    isAdminOrManager(user) {
        const codes = user.roles?.map((r) => r.code) || [];
        return codes.includes('admin') || codes.includes('middleware_ops');
    }
    hasTeamAccess(user) {
        const roles = user.roles;
        return !!roles?.some((r) => r.code === 'investment_manager' || r.dataScope === 'team' || r.dataScope === 'region' || r.dataScope === 'all');
    }
    async create(dto, operator) {
        await this.intakeService.findOne(dto.intakeId, operator);
        const followUp = new follow_up_entity_1.FollowUp();
        followUp.intakeId = dto.intakeId;
        followUp.method = dto.method;
        followUp.content = dto.content;
        followUp.followDate = new Date(dto.followDate);
        followUp.photos = dto.photos || [];
        followUp.result = (dto.result || 'undecided');
        followUp.nextStep = dto.nextStep;
        followUp.operator = { id: operator.id };
        return this.followUpRepo.save(followUp);
    }
    async findAll(query, currentUser) {
        const qb = this.followUpRepo.createQueryBuilder('f');
        qb.leftJoinAndSelect('f.operator', 'operator');
        if (query.intakeId) {
            await this.intakeService.findOne(query.intakeId, currentUser);
            qb.andWhere('f.intakeId = :intakeId', { intakeId: query.intakeId });
        }
        if (!this.isAdminOrManager(currentUser)) {
            qb.andWhere('f.operatorId = :userId', { userId: currentUser.id });
        }
        if (query.method) {
            qb.andWhere('f.method = :method', { method: query.method });
        }
        if (query.result) {
            qb.andWhere('f.result = :result', { result: query.result });
        }
        qb.orderBy('f.followDate', 'DESC');
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        qb.skip((page - 1) * pageSize).take(pageSize);
        return qb.getManyAndCount();
    }
    async findMy(query, currentUser) {
        const qb = this.followUpRepo.createQueryBuilder('f');
        qb.leftJoinAndSelect('f.operator', 'operator');
        qb.andWhere('f.operatorId = :userId', { userId: currentUser.id });
        if (query.intakeId) {
            qb.andWhere('f.intakeId = :intakeId', { intakeId: query.intakeId });
        }
        if (query.method) {
            qb.andWhere('f.method = :method', { method: query.method });
        }
        if (query.result) {
            qb.andWhere('f.result = :result', { result: query.result });
        }
        qb.orderBy('f.followDate', 'DESC');
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        qb.skip((page - 1) * pageSize).take(pageSize);
        return qb.getManyAndCount();
    }
    async findOne(id, currentUser) {
        const followUp = await this.followUpRepo.findOne({
            where: { id },
            relations: { operator: true },
        });
        if (!followUp) {
            throw new common_1.NotFoundException(`跟进记录 #${id} 不存在`);
        }
        if (!this.isAdminOrManager(currentUser) && followUp.operator?.id !== currentUser.id) {
            throw new common_1.ForbiddenException('无权访问此跟进记录');
        }
        return followUp;
    }
    async findByIntake(intakeId, currentUser) {
        await this.intakeService.findOne(intakeId, currentUser);
        const qb = this.followUpRepo.createQueryBuilder('f');
        qb.leftJoinAndSelect('f.operator', 'operator');
        qb.where('f.intakeId = :intakeId', { intakeId });
        if (!this.isAdminOrManager(currentUser)) {
            qb.andWhere('f.operatorId = :userId', { userId: currentUser.id });
        }
        qb.orderBy('f.followDate', 'DESC');
        return qb.getMany();
    }
    async countMyThisMonth(currentUser) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return this.followUpRepo
            .createQueryBuilder('f')
            .where('f.operatorId = :userId', { userId: currentUser.id })
            .andWhere('f.createdAt >= :start', { start: startOfMonth })
            .getCount();
    }
};
exports.FollowUpsService = FollowUpsService;
exports.FollowUpsService = FollowUpsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(follow_up_entity_1.FollowUp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        intake_service_1.IntakeService])
], FollowUpsService);
//# sourceMappingURL=follow-ups.service.js.map