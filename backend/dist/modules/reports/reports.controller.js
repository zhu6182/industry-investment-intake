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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const report_generator_service_1 = require("./report-generator.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const REPORT_ROLES = [
    'admin',
    'middleware_ops',
    'investment_manager',
];
let ReportsController = class ReportsController {
    reportService;
    constructor(reportService) {
        this.reportService = reportService;
    }
    async getByIntakeId(intakeId) {
        const id = Number(intakeId);
        if (Number.isNaN(id)) {
            throw new common_1.HttpException('无效的进件ID', common_1.HttpStatus.BAD_REQUEST);
        }
        const report = await this.reportService.requireByIntakeId(id);
        return report;
    }
    async download(intakeId, res) {
        const id = Number(intakeId);
        if (Number.isNaN(id)) {
            throw new common_1.HttpException('无效的进件ID', common_1.HttpStatus.BAD_REQUEST);
        }
        const report = await this.reportService.requireByIntakeId(id);
        res.download(report.pdfPath);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)(':intakeId'),
    __param(0, (0, common_1.Param)('intakeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getByIntakeId", null);
__decorate([
    (0, common_1.Get)(':intakeId/download'),
    __param(0, (0, common_1.Param)('intakeId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "download", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('api/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...REPORT_ROLES),
    __metadata("design:paramtypes", [report_generator_service_1.ReportGeneratorService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map