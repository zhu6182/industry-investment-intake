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
exports.FollowUpsController = void 0;
const common_1 = require("@nestjs/common");
const follow_ups_service_1 = require("./follow-ups.service");
const create_follow_up_dto_1 = require("./dto/create-follow-up.dto");
const query_follow_up_dto_1 = require("./dto/query-follow-up.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const ALL_ROLES = [
    'admin',
    'middleware_ops',
    'investment_manager',
    'investment_staff',
    'channel_manager',
    'channel_specialist',
];
let FollowUpsController = class FollowUpsController {
    followUpsService;
    constructor(followUpsService) {
        this.followUpsService = followUpsService;
    }
    async create(dto, req) {
        return this.followUpsService.create(dto, req.user);
    }
    async findAll(query, req) {
        if (query.intakeId) {
            return this.followUpsService.findByIntake(Number(query.intakeId), req.user);
        }
        return this.followUpsService.findAll(query, req.user);
    }
    async findMy(query, req) {
        return this.followUpsService.findMy(query, req.user);
    }
    async findOne(id, req) {
        return this.followUpsService.findOne(Number(id), req.user);
    }
};
exports.FollowUpsController = FollowUpsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_follow_up_dto_1.CreateFollowUpDto, Object]),
    __metadata("design:returntype", Promise)
], FollowUpsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_follow_up_dto_1.QueryFollowUpDto, Object]),
    __metadata("design:returntype", Promise)
], FollowUpsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_follow_up_dto_1.QueryFollowUpDto, Object]),
    __metadata("design:returntype", Promise)
], FollowUpsController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowUpsController.prototype, "findOne", null);
exports.FollowUpsController = FollowUpsController = __decorate([
    (0, common_1.Controller)('api/follow-ups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [follow_ups_service_1.FollowUpsService])
], FollowUpsController);
//# sourceMappingURL=follow-ups.controller.js.map