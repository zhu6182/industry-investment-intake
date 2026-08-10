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
var McpConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpConfigService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_entity_1 = require("../../entities/setting.entity");
const MCP_KEY = 'volcengine_agent_plan_mcp';
const DEFAULT_MCP_CONFIG = {
    enabled: false,
    url: 'https://datapro.hqd.cn-beijing.volces.com/mcp',
    headers: {
        'X-Agent-Plan-Key': '',
    },
    timeoutMs: 30000,
    note: '',
};
let McpConfigService = McpConfigService_1 = class McpConfigService {
    settingRepo;
    logger = new common_1.Logger(McpConfigService_1.name);
    constructor(settingRepo) {
        this.settingRepo = settingRepo;
    }
    async onModuleInit() {
        const cfg = await this.getConfig();
        this.exportToProcessEnv(cfg);
        this.logger.log(`[MCP] 启动加载: enabled=${cfg.enabled}, url=${cfg.url}, key=${cfg.headers['X-Agent-Plan-Key'] ? '***' + cfg.headers['X-Agent-Plan-Key'].slice(-8) : '(empty)'}`);
    }
    async getConfig() {
        const raw = await this.getByKey(MCP_KEY);
        if (!raw) {
            return { ...DEFAULT_MCP_CONFIG };
        }
        try {
            const parsed = JSON.parse(raw);
            return {
                ...DEFAULT_MCP_CONFIG,
                ...parsed,
                headers: { ...(parsed.headers || {}) },
            };
        }
        catch (e) {
            this.logger.warn(`Invalid MCP config JSON, fallback to default: ${e.message}`);
            return { ...DEFAULT_MCP_CONFIG };
        }
    }
    async updateConfig(partial) {
        const current = await this.getConfig();
        const next = {
            enabled: partial.enabled !== undefined ? !!partial.enabled : current.enabled,
            url: partial.url?.trim() || current.url,
            headers: partial.headers
                ? Object.fromEntries(Object.entries(partial.headers).filter(([_, v]) => v !== undefined && v !== null))
                : current.headers,
            timeoutMs: partial.timeoutMs !== undefined
                ? Math.min(60000, Math.max(1000, Number(partial.timeoutMs)))
                : current.timeoutMs,
            note: partial.note ?? current.note,
        };
        if (!next.url) {
            throw new Error('MCP URL 不能为空');
        }
        try {
            new URL(next.url);
        }
        catch {
            throw new Error(`MCP URL 格式不合法: ${next.url}`);
        }
        await this.setByKey(MCP_KEY, JSON.stringify(next), '火山 Agent Plan MCP 配置');
        this.exportToProcessEnv(next);
        this.logger.log(`[MCP] 已更新: enabled=${next.enabled}, url=${next.url}`);
        return next;
    }
    exportToProcessEnv(cfg) {
        process.env.VOLC_MCP_ENABLED = cfg.enabled ? 'true' : 'false';
        process.env.VOLC_MCP_URL = cfg.url;
        process.env.VOLC_MCP_HEADERS = JSON.stringify(cfg.headers || {});
        process.env.VOLC_MCP_TIMEOUT = String(cfg.timeoutMs);
    }
    getEnvSnapshot() {
        return {
            VOLC_MCP_ENABLED: process.env.VOLC_MCP_ENABLED || '',
            VOLC_MCP_URL: process.env.VOLC_MCP_URL || '',
            VOLC_MCP_HEADERS: process.env.VOLC_MCP_HEADERS || '',
            VOLC_MCP_TIMEOUT: process.env.VOLC_MCP_TIMEOUT || '',
        };
    }
    async testConnection(partial) {
        const cfg = partial ? await this.updateConfig(partial) : await this.getConfig();
        if (!cfg.url) {
            return { ok: false, latencyMs: 0, message: '未配置 MCP URL' };
        }
        const t0 = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
        try {
            const res = await fetch(cfg.url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    ...cfg.headers,
                },
                signal: controller.signal,
            });
            const latencyMs = Date.now() - t0;
            const text = await res.text().catch(() => '');
            const sample = text.length > 200 ? text.slice(0, 200) + '...' : text;
            if (res.status === 200 || res.status === 204) {
                return {
                    ok: true,
                    status: res.status,
                    statusText: res.statusText,
                    latencyMs,
                    message: `✓ 连通成功 (${latencyMs}ms)`,
                    sample,
                    envSnapshot: this.getEnvSnapshot(),
                };
            }
            if (res.status === 401 || res.status === 403) {
                return {
                    ok: false,
                    status: res.status,
                    statusText: res.statusText,
                    latencyMs,
                    message: `✗ 鉴权失败 (${res.status}) - 请检查 X-Agent-Plan-Key`,
                    sample,
                    envSnapshot: this.getEnvSnapshot(),
                };
            }
            if (res.status === 404) {
                return {
                    ok: false,
                    status: res.status,
                    statusText: res.statusText,
                    latencyMs,
                    message: `✗ 路径不存在 (404) - 检查 URL`,
                    sample,
                };
            }
            if (res.status === 405) {
                return {
                    ok: true,
                    status: res.status,
                    statusText: res.statusText,
                    latencyMs,
                    message: `✓ 服务可达 (${res.status} Method Not Allowed - 正常，MCP 仅支持 POST SSE)`,
                    sample,
                };
            }
            return {
                ok: res.status >= 200 && res.status < 500,
                status: res.status,
                statusText: res.statusText,
                latencyMs,
                message: `返回 HTTP ${res.status} ${res.statusText}`,
                sample,
            };
        }
        catch (e) {
            const latencyMs = Date.now() - t0;
            const isAbort = e?.name === 'AbortError';
            return {
                ok: false,
                latencyMs,
                message: isAbort
                    ? `✗ 请求超时 (>${cfg.timeoutMs}ms)`
                    : `✗ 连接失败: ${e?.message || e?.code || 'Unknown error'}`,
                envSnapshot: this.getEnvSnapshot(),
            };
        }
        finally {
            clearTimeout(timer);
        }
    }
    async getByKey(key) {
        const row = await this.settingRepo.findOne({ where: { key } });
        return row?.value ?? null;
    }
    async setByKey(key, value, description) {
        let row = await this.settingRepo.findOne({ where: { key } });
        if (!row) {
            row = this.settingRepo.create({ key, value, description });
        }
        else {
            row.value = value;
            if (description !== undefined)
                row.description = description;
        }
        await this.settingRepo.save(row);
    }
};
exports.McpConfigService = McpConfigService;
exports.McpConfigService = McpConfigService = McpConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], McpConfigService);
//# sourceMappingURL=mcp-config.service.js.map