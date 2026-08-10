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
exports.BiController = void 0;
const common_1 = require("@nestjs/common");
const bi_service_1 = require("./bi.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const BI_ROLES = [
    'admin',
    'middleware_ops',
    'investment_manager',
    'channel_manager',
];
let BiController = class BiController {
    biService;
    constructor(biService) {
        this.biService = biService;
    }
    async getAll(req) {
        return this.biService.getAllBiData(req.user);
    }
    async getMap(req) {
        return this.biService.getMapData(req.user);
    }
    async getCity(provinceCode, req) {
        return this.biService.getCityData(provinceCode, req.user);
    }
    async getStatus(req) {
        return this.biService.getStatusDistribution(req.user);
    }
    async getTrend(days, req) {
        return this.biService.getTrendData(req.user, Number(days) || 30);
    }
    async getIndustry(req) {
        return this.biService.getIndustryDistribution(req.user);
    }
    async getSummary(req) {
        return this.biService.getSummary(req.user);
    }
};
exports.BiController = BiController;
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BiController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('map'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BiController.prototype, "getMap", null);
__decorate([
    (0, common_1.Get)('map/city'),
    __param(0, (0, common_1.Query)('provinceCode')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BiController.prototype, "getCity", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BiController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('trend'),
    __param(0, (0, common_1.Query)('days')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BiController.prototype, "getTrend", null);
__decorate([
    (0, common_1.Get)('industry'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BiController.prototype, "getIndustry", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BiController.prototype, "getSummary", null);
exports.BiController = BiController = __decorate([
    (0, common_1.Controller)('api/bi'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...BI_ROLES),
    __metadata("design:paramtypes", [bi_service_1.BiService])
], BiController);
//# sourceMappingURL=bi.controller.js.map