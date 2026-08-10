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
var VolcMcpClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolcMcpClient = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mcp_config_service_1 = require("./mcp-config.service");
let VolcMcpClient = VolcMcpClient_1 = class VolcMcpClient {
    config;
    mcpConfig;
    logger = new common_1.Logger(VolcMcpClient_1.name);
    constructor(config, mcpConfig) {
        this.config = config;
        this.mcpConfig = mcpConfig;
    }
    async getConfig() {
        const cfg = await this.mcpConfig.getConfig();
        if (!cfg.enabled)
            return null;
        return cfg;
    }
    async callRpc(method, params = {}, id = 1) {
        const cfg = await this.getConfig();
        if (!cfg) {
            throw new Error('MCP 未启用或未配置 (系统设置 → MCP 服务配置)');
        }
        const t0 = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
        try {
            const res = await fetch(cfg.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Accept: 'application/json',
                    ...cfg.headers,
                },
                body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
                signal: controller.signal,
            });
            const text = await res.text();
            const latencyMs = Date.now() - t0;
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
            }
            const dataLine = text
                .split(/\r?\n/)
                .find((l) => l.startsWith('data:'));
            const jsonStr = dataLine ? dataLine.slice(5).trim() : text;
            const data = JSON.parse(jsonStr);
            if (data.error) {
                throw new Error(`MCP RPC error: ${data.error.message || JSON.stringify(data.error)}`);
            }
            this.logger.debug(`[MCP] ${method} ok, ${latencyMs}ms, result keys=${Object.keys(data.result || {}).join(',')}`);
            return data.result;
        }
        finally {
            clearTimeout(timer);
        }
    }
    async listTools() {
        const r = await this.callRpc('tools/list', {});
        return r?.tools || [];
    }
    async searchCompany(companyName, extra = '工商信息') {
        const t0 = Date.now();
        const query = `${companyName} ${extra}`.trim();
        try {
            const result = await this.callRpc('tools/call', {
                name: 'dataPro_search',
                arguments: { query },
            });
            const sc = result?.structuredContent || {};
            const rawItems = sc.items || [];
            const items = rawItems
                .map((it) => this.normalizeCompany(it))
                .filter((it) => it.name);
            return {
                ok: true,
                source: 'mcp',
                datasetType: sc.dataset_type,
                total: items.length,
                items,
                latencyMs: Date.now() - t0,
                message: items.length > 0
                    ? `✓ 通过火山 MCP 查询到 ${items.length} 条企业信息 (${sc.dataset_type || 'unknown'})`
                    : '未查询到企业信息',
                query,
                raw: result,
            };
        }
        catch (e) {
            const isAbort = e?.name === 'AbortError';
            return {
                ok: false,
                source: 'error',
                total: 0,
                items: [],
                latencyMs: Date.now() - t0,
                message: isAbort
                    ? `✗ MCP 请求超时`
                    : `✗ MCP 调用失败: ${e?.message || 'Unknown error'}`,
                query,
            };
        }
    }
    normalizeCompany(it) {
        const get = (k1, k2) => it[k1] ?? (k2 ? it[k2] : undefined);
        return {
            companyId: get('公司ID', 'companyId'),
            name: get('公司名称', 'name') || '',
            legalPerson: get('法人姓名', 'legalPersonName'),
            creditCode: get('统一社会信用代码', 'creditCode'),
            status: get('企业状态', 'status'),
            registeredCapital: get('注册资金', 'registeredCapital'),
            registerAddress: get('注册地址', 'registerAddress'),
            establishDate: this.formatDate(get('成立日期', 'establishDate') || get('营业期限开始日期')),
            industry: get('所属行业', 'industryName') || get('行业代码', 'industry') || get('行业', 'industry'),
            scope: get('经营范围', 'scope'),
            registryAuthority: get('登记机关', 'registryAuthority'),
            province: get('注册地址', 'registerAddress')?.slice(0, 3),
            raw: it,
        };
    }
    formatDate(v) {
        if (!v)
            return undefined;
        const s = String(v);
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        return m ? `${m[1]}-${m[2]}-${m[3]}` : s;
    }
};
exports.VolcMcpClient = VolcMcpClient;
exports.VolcMcpClient = VolcMcpClient = VolcMcpClient_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mcp_config_service_1.McpConfigService])
], VolcMcpClient);
//# sourceMappingURL=volc-mcp.client.js.map