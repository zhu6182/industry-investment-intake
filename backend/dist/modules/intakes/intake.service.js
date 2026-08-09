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
exports.IntakeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const intake_entity_1 = require("../../entities/intake.entity");
const intake_file_entity_1 = require("../../entities/intake-file.entity");
const user_entity_1 = require("../../entities/user.entity");
const review_entity_1 = require("../../entities/review.entity");
const tianyancha_service_1 = require("../tianyancha/tianyancha.service");
const report_generator_service_1 = require("../reports/report-generator.service");
const referrals_service_1 = require("../referrals/referrals.service");
let IntakeService = class IntakeService {
    intakeRepo;
    fileRepo;
    reviewRepo;
    userRepo;
    dataSource;
    tianyanchaService;
    reportService;
    referralsService;
    constructor(intakeRepo, fileRepo, reviewRepo, userRepo, dataSource, tianyanchaService, reportService, referralsService) {
        this.intakeRepo = intakeRepo;
        this.fileRepo = fileRepo;
        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
        this.dataSource = dataSource;
        this.tianyanchaService = tianyanchaService;
        this.reportService = reportService;
        this.referralsService = referralsService;
    }
    getUserDataScope(user) {
        if (!user.roles || user.roles.length === 0)
            return 'self';
        const roleDataScopes = user.roles.map((r) => r.dataScope);
        if (roleDataScopes.includes('all'))
            return 'all';
        if (roleDataScopes.includes('region'))
            return 'region';
        if (roleDataScopes.includes('team'))
            return 'team';
        return 'self';
    }
    getUserRoleCodes(user) {
        return user.roles?.map((r) => r.code) || [];
    }
    applyDataScopeFilter(qb, alias, user) {
        const scope = this.getUserDataScope(user);
        const roleCodes = this.getUserRoleCodes(user);
        if (roleCodes.includes('middleware_ops') || roleCodes.includes('admin')) {
            return;
        }
        switch (scope) {
            case 'all':
                return;
            case 'region':
                if (user.regionId) {
                    qb.andWhere(`${alias}.applicationRegionId = :regionId`, {
                        regionId: user.regionId,
                    });
                }
                return;
            case 'team':
                qb.andWhere(`${alias}.applicantId IN (SELECT u.id FROM users u WHERE u.regionId = :regionId)`, { regionId: user.regionId || 0 });
                return;
            case 'self':
            default:
                qb.andWhere(`${alias}.applicantId = :userId`, { userId: user.id });
                return;
        }
    }
    async checkExisting(companyName, excludeId) {
        const qb = this.intakeRepo.createQueryBuilder('i');
        qb.leftJoinAndSelect('i.assignedTo', 'assignedTo');
        qb.leftJoinAndSelect('i.applicant', 'applicant');
        qb.where('i.companyName = :companyName', { companyName });
        if (excludeId) {
            qb.andWhere('i.id != :excludeId', { excludeId });
        }
        qb.orderBy('i.createdAt', 'DESC');
        const existing = await qb.getOne();
        if (!existing) {
            return { exists: false };
        }
        return {
            exists: true,
            intakeId: existing.id,
            companyName: existing.companyName,
            status: existing.status,
            createdAt: existing.createdAt,
            applicantName: existing.applicant?.name,
            applicantPhone: existing.applicant?.phone,
            assignedToName: existing.assignedTo?.name,
            assignedToPhone: existing.assignedTo?.phone,
        };
    }
    async create(dto, applicantUser) {
        const exists = await this.checkExisting(dto.companyName);
        if (exists) {
            throw new common_1.BadRequestException(`企业 "${dto.companyName}" 已有在途跟进，请联系现有跟进人员`);
        }
        const intake = this.intakeRepo.create({
            companyName: dto.companyName,
            creditCode: dto.creditCode,
            legalPerson: dto.legalPerson,
            establishDate: dto.establishDate,
            industry: dto.industry,
            shareholders: dto.shareholders,
            applicationRegionId: dto.applicationRegionId,
            area: dto.area,
            applicant: { id: applicantUser.id },
            status: 'pending',
        });
        const validation = await this.tianyanchaService.validateAndEnrich(dto.companyName);
        intake.tycValidation = {
            isValid: validation.isValid,
            reasons: validation.reasons,
            company: validation.company,
        };
        if (validation.company.creditCode && !dto.creditCode) {
            intake.creditCode = validation.company.creditCode;
        }
        if (validation.company.legalPerson && !dto.legalPerson) {
            intake.legalPerson = validation.company.legalPerson;
        }
        if (validation.company.establishDate && !dto.establishDate) {
            intake.establishDate = validation.company.establishDate;
        }
        if (validation.company.industry && !dto.industry) {
            intake.industry = validation.company.industry;
        }
        if (validation.company.shareholders && validation.company.shareholders.length > 0) {
            intake.shareholders = JSON.stringify(validation.company.shareholders);
        }
        const saved = await this.intakeRepo.save(intake);
        if (dto.referrerId) {
            try {
                await this.referralsService.createReferral(saved.id, dto.referrerId, dto.referralType || 'referrer');
            }
            catch {
            }
        }
        return saved;
    }
    async findAll(query, currentUser) {
        const qb = this.intakeRepo.createQueryBuilder('i');
        qb.leftJoinAndSelect('i.applicant', 'applicant');
        qb.leftJoinAndSelect('i.assignedTo', 'assignedTo');
        this.applyDataScopeFilter(qb, 'i', currentUser);
        if (query.keyword) {
            qb.andWhere('(i.companyName LIKE :kw OR i.creditCode LIKE :kw OR i.legalPerson LIKE :kw)', { kw: `%${query.keyword}%` });
        }
        if (query.status) {
            qb.andWhere('i.status = :status', { status: query.status });
        }
        if (query.startDate) {
            qb.andWhere('i.createdAt >= :startDate', { startDate: query.startDate });
        }
        if (query.endDate) {
            qb.andWhere('i.createdAt <= :endDate', { endDate: query.endDate });
        }
        qb.orderBy('i.createdAt', 'DESC');
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        qb.skip((page - 1) * pageSize).take(pageSize);
        const [items, total] = await qb.getManyAndCount();
        return [items, total];
    }
    async findOne(id, currentUser) {
        const qb = this.intakeRepo.createQueryBuilder('i');
        qb.leftJoinAndSelect('i.applicant', 'applicant');
        qb.leftJoinAndSelect('i.assignedTo', 'assignedTo');
        qb.leftJoinAndSelect('i.files', 'files');
        qb.where('i.id = :id', { id });
        this.applyDataScopeFilter(qb, 'i', currentUser);
        const intake = await qb.getOne();
        if (!intake) {
            throw new common_1.NotFoundException(`进件记录 #${id} 不存在或无权限访问`);
        }
        return intake;
    }
    async update(id, dto, currentUser) {
        const intake = await this.findOne(id, currentUser);
        Object.assign(intake, dto);
        if (dto.companyName && dto.companyName !== intake.companyName) {
            const exists = await this.checkExisting(dto.companyName, id);
            if (exists) {
                throw new common_1.BadRequestException(`企业 "${dto.companyName}" 已有在途跟进`);
            }
        }
        return this.intakeRepo.save(intake);
    }
    async submit(id, currentUser) {
        const intake = await this.findOne(id, currentUser);
        if (intake.tycValidation?.isValid) {
            intake.status = 'approved';
        }
        else {
            intake.status = 'rejected';
            intake.rejectReason =
                intake.tycValidation?.reasons?.join('；') || '天眼查核名未通过';
        }
        return this.intakeRepo.save(intake);
    }
    async addFiles(intakeId, filesData) {
        const intake = await this.intakeRepo.findOne({ where: { id: intakeId } });
        if (!intake) {
            throw new common_1.NotFoundException(`进件记录 #${intakeId} 不存在`);
        }
        const savedFiles = filesData.map((f) => this.fileRepo.create({
            type: f.type,
            url: f.url,
            originalName: f.originalName,
            storedName: f.storedName,
            size: f.size,
            intake: { id: intakeId },
        }));
        return this.fileRepo.save(savedFiles);
    }
    async review(id, action, reason, assignToUserId, reviewer) {
        const intake = await this.intakeRepo.findOne({
            where: { id },
            relations: { applicant: true, assignedTo: true, files: true },
        });
        if (!intake) {
            throw new common_1.NotFoundException(`进件记录 #${id} 不存在`);
        }
        if (intake.status !== 'pending') {
            throw new common_1.BadRequestException(`该进件当前状态为 "${intake.status}"，仅 "待审核" 状态可执行审核`);
        }
        let assignToUser;
        if (action === 'approve') {
            intake.status = assignToUserId ? 'assigned' : 'approved';
            intake.rejectReason = '';
            if (assignToUserId) {
                const found = await this.userRepo.findOne({ where: { id: assignToUserId } });
                if (!found) {
                    throw new common_1.BadRequestException(`指定的招商人员 #${assignToUserId} 不存在`);
                }
                assignToUser = found;
                intake.assignedTo = found;
            }
        }
        else {
            intake.status = 'rejected';
            if (!reason || reason.trim().length === 0) {
                throw new common_1.BadRequestException('驳回操作必须填写原因');
            }
            intake.rejectReason = reason;
        }
        const savedIntake = await this.intakeRepo.save(intake);
        const review = this.reviewRepo.create({
            intakeId: id,
            action,
            reason,
            reviewer: { id: reviewer.id },
            assignedToId: assignToUserId,
        });
        await this.reviewRepo.save(review);
        let reportGenerated = false;
        let reportUrl = null;
        if (action === 'approve') {
            try {
                const report = await this.reportService.generate(savedIntake, assignToUser);
                reportGenerated = true;
                reportUrl = report.pdfUrl;
            }
            catch (err) {
                reportGenerated = false;
            }
        }
        return {
            intake: savedIntake,
            review,
            reportGenerated,
            reportUrl,
        };
    }
    async getStatusHistory(id) {
        const reviews = await this.reviewRepo.find({
            where: { intakeId: id },
            order: { createdAt: 'DESC' },
        });
        return reviews;
    }
    async updateStatus(id, newStatus, operator) {
        const intake = await this.findOne(id, operator);
        const allowedTransitions = {
            pending: ['rejected', 'approved'],
            approved: ['assigned'],
            assigned: ['following'],
            following: ['landed', 'lost'],
            landed: [],
            lost: [],
            rejected: [],
        };
        const allowed = allowedTransitions[intake.status] || [];
        if (allowed.length > 0 && !allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`不允许从 "${intake.status}" 变更到 "${newStatus}"`);
        }
        intake.status = newStatus;
        return this.intakeRepo.save(intake);
    }
};
exports.IntakeService = IntakeService;
exports.IntakeService = IntakeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(intake_entity_1.Intake)),
    __param(1, (0, typeorm_1.InjectRepository)(intake_file_entity_1.IntakeFile)),
    __param(2, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        tianyancha_service_1.TianyanchaService,
        report_generator_service_1.ReportGeneratorService,
        referrals_service_1.ReferralsService])
], IntakeService);
//# sourceMappingURL=intake.service.js.map