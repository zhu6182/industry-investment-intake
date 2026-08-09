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
var IntakeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntakeController = void 0;
const common_1 = require("@nestjs/common");
const intake_service_1 = require("./intake.service");
const create_intake_dto_1 = require("./dto/create-intake.dto");
const update_intake_dto_1 = require("./dto/update-intake.dto");
const query_intake_dto_1 = require("./dto/query-intake.dto");
const check_intake_dto_1 = require("./dto/check-intake.dto");
const review_intake_dto_1 = require("./dto/review-intake.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const duplicate_check_log_entity_1 = require("../../entities/duplicate-check-log.entity");
const ALL_ROLES = [
    'admin',
    'middleware_ops',
    'investment_manager',
    'investment_staff',
    'channel_manager',
    'channel_specialist',
];
const INTAKE_CREATORS = [
    'admin',
    'channel_manager',
    'channel_specialist',
];
const INTAKE_EDITORS = [
    'admin',
    'channel_manager',
    'channel_specialist',
];
const INTAKE_REVIEWERS = [
    'admin',
    'middleware_ops',
    'investment_manager',
];
let IntakeController = IntakeController_1 = class IntakeController {
    intakeService;
    dupLogRepo;
    logger = new common_1.Logger(IntakeController_1.name);
    constructor(intakeService, dupLogRepo) {
        this.intakeService = intakeService;
        this.dupLogRepo = dupLogRepo;
    }
    async create(dto, req) {
        return this.intakeService.create(dto, req.user);
    }
    async findAll(query, req) {
        return this.intakeService.findAll(query, req.user);
    }
    async findOne(id, req) {
        return this.intakeService.findOne(Number(id), req.user);
    }
    async check(dto, req) {
        const result = await this.intakeService.checkExisting(dto.companyName);
        if (result.exists) {
            const u = req.user;
            this.logger.warn(`[查重命中] "${dto.companyName}" 命中进件 #${result.intakeId} (${result.status}, ${result.createdAt?.toISOString()}) - 查询人: ${u?.name} (id=${u?.id}, phone=${u?.phone}) at ${new Date().toISOString()}`);
            try {
                await this.dupLogRepo.save({
                    companyName: dto.companyName,
                    intakeId: result.intakeId,
                    intakeCompanyName: result.companyName,
                    intakeStatus: result.status,
                    intakeCreatedAt: result.createdAt,
                    checkerId: u.id,
                    checkerName: u.name,
                    checkerPhone: u.phone,
                    sourceIp: req.ip,
                });
            }
            catch (e) {
                this.logger.error(`[查重日志] 写入失败: ${e.message}`);
            }
        }
        return result;
    }
    async update(id, dto, req) {
        return this.intakeService.update(Number(id), dto, req.user);
    }
    async submit(id, req) {
        return this.intakeService.submit(Number(id), req.user);
    }
    async review(id, dto, req) {
        return this.intakeService.review(Number(id), dto.action, dto.reason, dto.assignToUserId, req.user);
    }
    async getHistory(id) {
        return this.intakeService.getStatusHistory(Number(id));
    }
};
exports.IntakeController = IntakeController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...INTAKE_CREATORS),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_intake_dto_1.CreateIntakeDto, Object]),
    __metadata("design:returntype", Promise)
], IntakeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_intake_dto_1.QueryIntakeDto, Object]),
    __metadata("design:returntype", Promise)
], IntakeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntakeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('check'),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_intake_dto_1.CheckIntakeDto, Object]),
    __metadata("design:returntype", Promise)
], IntakeController.prototype, "check", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(...INTAKE_EDITORS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_intake_dto_1.UpdateIntakeDto, Object]),
    __metadata("design:returntype", Promise)
], IntakeController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)(...INTAKE_CREATORS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntakeController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)(':id/review'),
    (0, roles_decorator_1.Roles)(...INTAKE_REVIEWERS),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, review_intake_dto_1.ReviewIntakeDto, Object]),
    __metadata("design:returntype", Promise)
], IntakeController.prototype, "review", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntakeController.prototype, "getHistory", null);
exports.IntakeController = IntakeController = IntakeController_1 = __decorate([
    (0, common_1.Controller)('api/intakes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(1, (0, typeorm_1.InjectRepository)(duplicate_check_log_entity_1.DuplicateCheckLog)),
    __metadata("design:paramtypes", [intake_service_1.IntakeService,
        typeorm_2.Repository])
], IntakeController);
//# sourceMappingURL=intake.controller.js.map