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
exports.VisitsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const visit_entity_1 = require("../../entities/visit.entity");
const intake_entity_1 = require("../../entities/intake.entity");
const intake_service_1 = require("../intakes/intake.service");
let VisitsService = class VisitsService {
    visitRepo;
    intakeRepo;
    intakeService;
    constructor(visitRepo, intakeRepo, intakeService) {
        this.visitRepo = visitRepo;
        this.intakeRepo = intakeRepo;
        this.intakeService = intakeService;
    }
    isAdminOrManager(user) {
        const codes = user.roles?.map((r) => r.code) || [];
        return codes.includes('admin') || codes.includes('middleware_ops');
    }
    async create(dto, operator) {
        const intake = await this.intakeService.findOne(dto.intakeId, operator);
        const visit = new visit_entity_1.Visit();
        visit.intakeId = dto.intakeId;
        visit.visitDate = new Date(dto.visitDate);
        visit.visitLocation = dto.visitLocation;
        visit.visitContent = dto.visitContent;
        visit.photos = dto.photos || [];
        visit.applicationRegionId = dto.applicationRegionId;
        visit.area = dto.area;
        visit.operator = { id: operator.id };
        const saved = await this.visitRepo.save(visit);
        if (dto.area && (!intake.area || dto.area > intake.area)) {
            await this.intakeRepo
                .createQueryBuilder()
                .update(intake_entity_1.Intake)
                .set({ area: dto.area, applicationRegionId: dto.applicationRegionId || intake.applicationRegionId })
                .where('id = :id', { id: intake.id })
                .execute();
        }
        return saved;
    }
    async findAll(query, currentUser) {
        const qb = this.visitRepo.createQueryBuilder('v');
        qb.leftJoinAndSelect('v.operator', 'operator');
        qb.leftJoinAndSelect('v.region', 'region');
        if (query.intakeId) {
            await this.intakeService.findOne(query.intakeId, currentUser);
            qb.andWhere('v.intakeId = :intakeId', { intakeId: query.intakeId });
        }
        if (!this.isAdminOrManager(currentUser)) {
            qb.andWhere('v.operatorId = :userId', { userId: currentUser.id });
        }
        qb.orderBy('v.visitDate', 'DESC');
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        qb.skip((page - 1) * pageSize).take(pageSize);
        return qb.getManyAndCount();
    }
    async findMy(query, currentUser) {
        const qb = this.visitRepo.createQueryBuilder('v');
        qb.leftJoinAndSelect('v.operator', 'operator');
        qb.leftJoinAndSelect('v.region', 'region');
        qb.andWhere('v.operatorId = :userId', { userId: currentUser.id });
        if (query.intakeId) {
            qb.andWhere('v.intakeId = :intakeId', { intakeId: query.intakeId });
        }
        qb.orderBy('v.visitDate', 'DESC');
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        qb.skip((page - 1) * pageSize).take(pageSize);
        return qb.getManyAndCount();
    }
    async findOne(id, currentUser) {
        const visit = await this.visitRepo.findOne({
            where: { id },
            relations: { operator: true, region: true },
        });
        if (!visit) {
            throw new common_1.NotFoundException(`拜访记录 #${id} 不存在`);
        }
        if (!this.isAdminOrManager(currentUser) && visit.operator?.id !== currentUser.id) {
            throw new common_1.ForbiddenException('无权访问此拜访记录');
        }
        return visit;
    }
    async findByIntake(intakeId, currentUser) {
        await this.intakeService.findOne(intakeId, currentUser);
        const qb = this.visitRepo.createQueryBuilder('v');
        qb.leftJoinAndSelect('v.operator', 'operator');
        qb.leftJoinAndSelect('v.region', 'region');
        qb.where('v.intakeId = :intakeId', { intakeId });
        if (!this.isAdminOrManager(currentUser)) {
            qb.andWhere('v.operatorId = :userId', { userId: currentUser.id });
        }
        qb.orderBy('v.visitDate', 'DESC');
        return qb.getMany();
    }
    async countMyThisMonth(currentUser) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return this.visitRepo
            .createQueryBuilder('v')
            .where('v.operatorId = :userId', { userId: currentUser.id })
            .andWhere('v.createdAt >= :start', { start: startOfMonth })
            .getCount();
    }
};
exports.VisitsService = VisitsService;
exports.VisitsService = VisitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(visit_entity_1.Visit)),
    __param(1, (0, typeorm_1.InjectRepository)(intake_entity_1.Intake)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        intake_service_1.IntakeService])
], VisitsService);
//# sourceMappingURL=visits.service.js.map