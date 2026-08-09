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
exports.McpController = void 0;
const common_1 = require("@nestjs/common");
const volc_mcp_client_1 = require("./volc-mcp.client");
const mcp_config_service_1 = require("./mcp-config.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let McpController = class McpController {
    mcpClient;
    mcpConfig;
    constructor(mcpClient, mcpConfig) {
        this.mcpClient = mcpClient;
        this.mcpConfig = mcpConfig;
    }
    async status() {
        const cfg = await this.mcpConfig.getConfig();
        return {
            enabled: cfg.enabled,
            url: cfg.url,
            configured: !!cfg.headers['X-Agent-Plan-Key'],
        };
    }
    async listTools() {
        try {
            const tools = await this.mcpClient.listTools();
            return { ok: true, tools };
        }
        catch (e) {
            return { ok: false, message: e.message, tools: [] };
        }
    }
    async searchCompany(body) {
        const name = (body.name || '').trim();
        if (!name) {
            return {
                ok: false,
                source: 'error',
                total: 0,
                items: [],
                latencyMs: 0,
                message: '企业名称不能为空',
                query: '',
            };
        }
        return this.mcpClient.searchCompany(name, body.extra);
    }
};
exports.McpController = McpController;
__decorate([
    (0, common_1.Get)('status'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], McpController.prototype, "status", null);
__decorate([
    (0, common_1.Get)('tools'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], McpController.prototype, "listTools", null);
__decorate([
    (0, common_1.Post)('company/search'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "searchCompany", null);
exports.McpController = McpController = __decorate([
    (0, common_1.Controller)('api/mcp'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [volc_mcp_client_1.VolcMcpClient,
        mcp_config_service_1.McpConfigService])
], McpController);
//# sourceMappingURL=mcp.controller.js.map