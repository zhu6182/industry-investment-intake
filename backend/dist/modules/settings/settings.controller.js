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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const mcp_config_service_1 = require("./mcp-config.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let SettingsController = class SettingsController {
    settingsService;
    mcpConfig;
    constructor(settingsService, mcpConfig) {
        this.settingsService = settingsService;
        this.mcpConfig = mcpConfig;
    }
    getReportTemplate() {
        return this.settingsService.getReportTemplate();
    }
    updateReportTemplate(body) {
        return this.settingsService.updateReportTemplate(body);
    }
    getMcpConfig() {
        return this.mcpConfig.getConfig();
    }
    updateMcpConfig(body) {
        return this.mcpConfig.updateConfig(body);
    }
    testMcpConnection(body) {
        return this.mcpConfig.testConnection(body);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('report-template'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getReportTemplate", null);
__decorate([
    (0, common_1.Patch)('report-template'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateReportTemplate", null);
__decorate([
    (0, common_1.Get)('volcengine-mcp'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getMcpConfig", null);
__decorate([
    (0, common_1.Put)('volcengine-mcp'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateMcpConfig", null);
__decorate([
    (0, common_1.Post)('volcengine-mcp/test'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "testMcpConnection", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('api/settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [settings_service_1.SettingsService,
        mcp_config_service_1.McpConfigService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map