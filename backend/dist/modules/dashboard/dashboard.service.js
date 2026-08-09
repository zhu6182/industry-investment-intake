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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const intake_entity_1 = require("../../entities/intake.entity");
const review_entity_1 = require("../../entities/review.entity");
const report_entity_1 = require("../../entities/report.entity");
const intake_service_1 = require("../intakes/intake.service");
const follow_ups_service_1 = require("../follow-ups/follow-ups.service");
const visits_service_1 = require("../visits/visits.service");
let DashboardService = class DashboardService {
    intakeRepo;
    reviewRepo;
    reportRepo;
    intakeService;
    followUpsService;
    visitsService;
    constructor(intakeRepo, reviewRepo, reportRepo, intakeService, followUpsService, visitsService) {
        this.intakeRepo = intakeRepo;
        this.reviewRepo = reviewRepo;
        this.reportRepo = reportRepo;
        this.intakeService = intakeService;
        this.followUpsService = followUpsService;
        this.visitsService = visitsService;
    }
    async getTimeline(intakeId, currentUser) {
        const intake = await this.intakeService.findOne(intakeId, currentUser);
        const reviews = await this.reviewRepo.find({
            where: { intakeId },
            relations: { reviewer: true },
            order: { createdAt: 'ASC' },
        });
        const reports = await this.reportRepo.find({
            where: { intakeId },
            order: { createdAt: 'ASC' },
        });
        let followUps = [];
        let visits = [];
        try {
            followUps = await this.followUpsService.findByIntake(intakeId, currentUser);
        }
        catch {
            followUps = [];
        }
        try {
            visits = await this.visitsService.findByIntake(intakeId, currentUser);
        }
        catch {
            visits = [];
        }
        const events = [];
        events.push({
            type: 'intake_created',
            time: intake.createdAt,
            title: '进件创建',
            description: `企业 ${intake.companyName} 提交进件申请`,
            actor: intake.applicant?.name || '-',
            data: null,
        });
        if (intake.tycValidation) {
            events.push({
                type: 'tyc_verified',
                time: intake.createdAt,
                title: intake.tycValidation.isValid ? '天眼查核名通过' : '天眼查核名未通过',
                description: intake.tycValidation.reasons?.join('；') || '',
                actor: '系统',
                data: intake.tycValidation,
            });
        }
        for (const review of reviews) {
            events.push({
                type: 'review',
                time: review.createdAt,
                title: review.action === 'approve' ? '审核通过' : '审核驳回',
                description: review.reason || '',
                actor: review.reviewer?.name || '-',
                data: review,
            });
        }
        for (const report of reports) {
            events.push({
                type: 'report_generated',
                time: report.createdAt,
                title: '报告生成',
                description: report.summary?.title || '制式报告已生成',
                actor: '系统',
                data: report,
            });
        }
        for (const fu of followUps) {
            const methodMap = {
                phone: '电话',
                wechat: '微信',
                email: '邮件',
                onsite: '上门',
                other: '其他',
            };
            events.push({
                type: 'follow_up',
                time: fu.followDate,
                title: `${methodMap[fu.method] || fu.method}跟进`,
                description: fu.content,
                actor: fu.operator?.name || '-',
                data: fu,
            });
        }
        for (const v of visits) {
            events.push({
                type: 'visit',
                time: v.visitDate,
                title: `拜访 - ${v.visitLocation}`,
                description: v.visitContent,
                actor: v.operator?.name || '-',
                data: v,
            });
        }
        events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        return events;
    }
    async getDashboardStats(currentUser) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const roles = currentUser.roles;
        const isAdminOrOps = roles?.some((r) => r.code === 'admin' || r.code === 'middleware_ops');
        let pendingQB = this.intakeRepo.createQueryBuilder('i');
        let myQB = this.intakeRepo.createQueryBuilder('i');
        if (!isAdminOrOps) {
            pendingQB.where('i.assignedToId = :userId', { userId: currentUser.id });
            myQB.where('i.assignedToId = :userId', { userId: currentUser.id });
        }
        pendingQB.andWhere('i.status IN (:...statuses)', {
            statuses: ['assigned', 'following'],
        });
        myQB.andWhere('i.status NOT IN (:...statuses)', {
            statuses: ['landed', 'lost'],
        });
        const [pendingCount, myActiveCount] = await Promise.all([
            pendingQB.getCount(),
            myQB.getCount(),
        ]);
        const [followUpThisMonth, visitThisMonth] = await Promise.all([
            this.followUpsService.countMyThisMonth(currentUser),
            this.visitsService.countMyThisMonth(currentUser),
        ]);
        return {
            pendingCount,
            myActiveCount,
            followUpThisMonth,
            visitThisMonth,
        };
    }
    async getTeamStats(currentUser) {
        const roles = currentUser.roles;
        const isManager = roles?.some((r) => r.code === 'investment_manager' || r.code === 'admin' || r.code === 'middleware_ops');
        if (!isManager) {
            return { members: [], totalFollowUps: 0, totalVisits: 0 };
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const assignedQB = this.intakeRepo.createQueryBuilder('i');
        assignedQB.where('i.assignedToId IS NOT NULL');
        const [assignedIntakes, totalIntakes] = await assignedQB.getManyAndCount();
        return {
            totalIntakes,
            startOfMonth,
            isManager: true,
            memberSummary: assignedIntakes.map((i) => ({
                intakeId: i.id,
                companyName: i.companyName,
                status: i.status,
                area: i.area,
                assignedToId: i.assignedTo?.id,
            })),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(intake_entity_1.Intake)),
    __param(1, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(2, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        intake_service_1.IntakeService,
        follow_ups_service_1.FollowUpsService,
        visits_service_1.VisitsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map