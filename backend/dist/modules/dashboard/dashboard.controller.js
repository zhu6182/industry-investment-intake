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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
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
const TEAM_ROLES = [
    'admin',
    'middleware_ops',
    'investment_manager',
    'channel_manager',
];
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getTimeline(intakeId, req) {
        return this.dashboardService.getTimeline(Number(intakeId), req.user);
    }
    async getDashboardStats(req) {
        return this.dashboardService.getDashboardStats(req.user);
    }
    async getTeamStats(req) {
        return this.dashboardService.getTeamStats(req.user);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('timeline/:intakeId'),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __param(0, (0, common_1.Param)('intakeId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Get)('stats/dashboard'),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('stats/team'),
    (0, roles_decorator_1.Roles)(...TEAM_ROLES),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getTeamStats", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('api'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map