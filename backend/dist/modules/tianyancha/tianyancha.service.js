"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TianyanchaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TianyanchaService = exports.TYC_INVALID_STATUS_KEYWORDS = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const https = __importStar(require("https"));
const ioredis_1 = __importDefault(require("ioredis"));
const dayjs_1 = __importDefault(require("dayjs"));
const mcp_config_service_1 = require("../settings/mcp-config.service");
const volc_mcp_client_1 = require("../settings/volc-mcp.client");
exports.TYC_INVALID_STATUS_KEYWORDS = ['注销', '吊销', '在途执行', '在途'];
let TianyanchaService = TianyanchaService_1 = class TianyanchaService {
    configService;
    mcpConfig;
    mcpClient;
    logger = new common_1.Logger(TianyanchaService_1.name);
    config;
    redis = null;
    constructor(configService, mcpConfig, mcpClient) {
        this.configService = configService;
        this.mcpConfig = mcpConfig;
        this.mcpClient = mcpClient;
        this.config = this.configService.get('tianyancha');
        this.logger.log('[企业查询] 统一走火山 Agent Plan MCP 真实数据源');
        const redisHost = this.configService.get('redis.host', 'localhost');
        const redisPort = this.configService.get('redis.port', 6379);
        const redisEnabled = this.configService.get('redis.enabled', false);
        if (redisEnabled) {
            try {
                this.redis = new ioredis_1.default({
                    host: redisHost,
                    port: redisPort,
                    lazyConnect: true,
                    maxRetriesPerRequest: 1,
                    enableReadyCheck: false,
                    retryStrategy: () => null,
                    reconnectOnError: () => false,
                });
                let warned = false;
                this.redis.on('error', (err) => {
                    if (!warned) {
                        this.logger.warn(`Redis unavailable (caching disabled): ${err.message}`);
                        warned = true;
                        this.redis?.disconnect();
                        this.redis = null;
                    }
                });
            }
            catch (err) {
                this.logger.warn(`Redis init failed, caching disabled: ${err.message}`);
                this.redis = null;
            }
        }
    }
    sign(timestamp, nonce) {
        const signStr = `${timestamp}${nonce}${this.config.appKey}`;
        return crypto
            .createHmac('sha256', this.config.secretKey)
            .update(signStr)
            .digest('base64');
    }
    randomNonce() {
        return crypto.randomBytes(16).toString('hex');
    }
    cacheKey(action, name) {
        return `tyc:${action}:${name}`;
    }
    async cacheGet(key) {
        if (!this.redis)
            return null;
        try {
            const raw = await this.redis.get(key);
            if (!raw)
                return null;
            return JSON.parse(raw);
        }
        catch (err) {
            this.logger.warn(`Redis get error: ${err.message}`);
            return null;
        }
    }
    async cacheSet(key, value) {
        if (!this.redis)
            return;
        try {
            await this.redis.set(key, JSON.stringify(value), 'EX', this.config.cacheTtl);
        }
        catch (err) {
            this.logger.warn(`Redis set error: ${err.message}`);
        }
    }
    request(path, params) {
        return new Promise((resolve) => {
            const timestamp = String(Date.now());
            const nonce = this.randomNonce();
            const sign = this.sign(timestamp, nonce);
            const query = new URLSearchParams({
                ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
                appkey: this.config.appKey,
                timestamp,
                nonce,
                sign,
            }).toString();
            const url = `${this.config.baseUrl}${path}?${query}`;
            let parsedUrl;
            try {
                parsedUrl = new URL(url);
            }
            catch (err) {
                this.logger.error(`Invalid TYC URL: ${err.message}`);
                resolve(null);
                return;
            }
            const options = {
                method: 'GET',
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: `${parsedUrl.pathname}${parsedUrl.search}`,
                timeout: this.config.requestTimeout,
                headers: {
                    Accept: 'application/json',
                },
            };
            const req = https.request(options, (res) => {
                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    const body = Buffer.concat(chunks).toString('utf8');
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const json = JSON.parse(body);
                            if (json.state === 'ok' ||
                                json.state === '200' ||
                                json.state === 200 ||
                                json.state === 1) {
                                resolve(json.data);
                            }
                            else {
                                this.logger.warn(`TYC API error: state=${json.state}, msg=${json.errorMsg ?? ''}`);
                                resolve(null);
                            }
                        }
                        catch (err) {
                            this.logger.error(`TYC JSON parse error: ${err.message}`);
                            resolve(null);
                        }
                    }
                    else {
                        this.logger.warn(`TYC HTTP ${res.statusCode}: ${body.slice(0, 200)}`);
                        resolve(null);
                    }
                });
            });
            req.on('timeout', () => {
                this.logger.warn('TYC request timeout');
                req.destroy(new Error('TYC timeout'));
            });
            req.on('error', (err) => {
                this.logger.warn(`TYC request error: ${err.message}`);
                resolve(null);
            });
            req.end();
        });
    }
    async searchCompany(name) {
        const cacheKey = this.cacheKey('search', name);
        const cached = await this.cacheGet(cacheKey);
        if (cached)
            return cached;
        const mcp = await this.mcpClient.searchCompany(name);
        const results = mcp.items.map((it) => ({
            id: (it.companyId ?? ''),
            name: it.name,
            creditCode: it.creditCode || '',
            legalPersonName: it.legalPerson || '',
            startDate: it.establishDate || '',
            status: it.status || '',
        }));
        await this.cacheSet(cacheKey, results);
        return results;
    }
    async getCompanyDetail(companyName) {
        const cacheKey = this.cacheKey('detail', companyName);
        const cached = await this.cacheGet(cacheKey);
        if (cached)
            return cached;
        const mcpCfg = await this.mcpConfig.getConfig();
        if (!mcpCfg.enabled) {
            this.logger.error(`[MCP] 未启用,无法查询企业: ${companyName}。请到 系统设置 -> MCP 服务配置 启用`);
            return null;
        }
        const t0 = Date.now();
        const mcp = await this.mcpClient.searchCompany(companyName);
        this.logger.log(`[MCP] search "${companyName}" ${mcp.ok ? 'OK' : 'FAIL'} ${mcp.items.length} items, ${Date.now() - t0}ms, dataset=${mcp.datasetType || 'n/a'}, msg="${mcp.message}"`);
        const it = mcp.items[0];
        if (!it) {
            this.logger.warn(`[MCP] 未找到企业: ${companyName}`);
            return null;
        }
        const detail = {
            id: it.companyId ?? companyName,
            name: it.name || companyName,
            creditCode: it.creditCode || '',
            legalPersonName: it.legalPerson || '',
            startDate: it.establishDate || '',
            status: it.status || '',
            registeredCapital: it.registeredCapital || '',
            industry: it.industry || '',
            shareholders: [],
        };
        await this.cacheSet(cacheKey, detail);
        return detail;
    }
    riskCache = new Map();
    async validateAndEnrich(companyName) {
        const reasons = [];
        const emptyResult = {
            isValid: false,
            reasons,
            rating: 0,
            company: {
                name: companyName,
                shareholders: [],
            },
            source: 'mcp',
        };
        const detail = await this.getCompanyDetail(companyName);
        if (!detail) {
            reasons.push('未查询到企业信息');
            return emptyResult;
        }
        const status = detail.status ?? '';
        const isRevoked = exports.TYC_INVALID_STATUS_KEYWORDS.some((kw) => status.includes(kw));
        if (isRevoked) {
            reasons.push(`企业状态异常：${status}`);
        }
        let years = 0;
        if (detail.startDate) {
            const start = (0, dayjs_1.default)(detail.startDate);
            if (start.isValid()) {
                years = Math.max(0, (0, dayjs_1.default)().diff(start, 'year'));
                if (years < 2) {
                    reasons.push(`企业成立不足 2 年（${years} 年）`);
                }
            }
            else {
                reasons.push('无法识别企业成立时间');
            }
        }
        else {
            reasons.push('无法获取企业成立时间');
        }
        const risk = this.evaluateRisk(detail);
        if (risk.hasExecution) {
            reasons.push(`存在在途执行案件（${risk.executionCount} 条），需先结案再申报`);
        }
        if (risk.hasDishonesty) {
            reasons.push('企业被列入失信被执行人');
        }
        const ratingBreakdown = this.calculateRating(detail, years, risk);
        const isValid = reasons.length === 0;
        return {
            isValid,
            reasons,
            rating: ratingBreakdown.total,
            ratingBreakdown,
            risk,
            company: {
                name: detail.name,
                creditCode: detail.creditCode,
                legalPerson: detail.legalPersonName,
                establishDate: detail.startDate,
                status: detail.status,
                registeredCapital: detail.registeredCapital,
                industry: detail.industry,
                shareholders: detail.shareholders ?? [],
            },
            source: 'mcp',
        };
    }
    evaluateRisk(detail) {
        const cached = this.riskCache.get(detail.name);
        if (cached) {
            this.riskCache.delete(detail.name);
            return cached;
        }
        const status = detail.status ?? '';
        const isRevoked = exports.TYC_INVALID_STATUS_KEYWORDS.some((kw) => status.includes(kw));
        return {
            hasExecution: false,
            hasDishonesty: false,
            hasLawsuit: false,
            isRevoked,
            executionCount: 0,
            riskLevel: isRevoked ? 'high' : 'low',
        };
    }
    calculateRating(detail, years, risk) {
        const ageMax = 30;
        const age = Math.min(years, ageMax);
        const ageScore = Math.round((age / ageMax) * 25);
        const capMatch = (detail.registeredCapital ?? '').match(/(\d+(?:\.\d+)?)/);
        const capitalNum = capMatch ? parseFloat(capMatch[1]) : 0;
        const capMax = 10000;
        const registeredCapital = Math.min(capitalNum, capMax);
        const registeredCapitalScore = Math.round((registeredCapital / capMax) * 20);
        const statusMax = 20;
        let statusScore = statusMax;
        if (risk.isRevoked)
            statusScore = 0;
        else if (risk.riskLevel === 'high')
            statusScore = 4;
        else if (risk.riskLevel === 'medium')
            statusScore = 10;
        const riskMax = 15;
        let riskScore = riskMax;
        if (risk.hasExecution)
            riskScore = 0;
        else if (risk.hasDishonesty)
            riskScore = 0;
        else if (risk.hasLawsuit)
            riskScore = 6;
        const industryMax = 10;
        let industryScore = industryMax;
        const hotIndustries = [
            '科技', '信息技术', '互联网', '软件', '半导体', '集成电路', '新能源',
            '生物医药', '高端装备', '智能制造', '新材料',
        ];
        const industry = detail.industry ?? '';
        if (!industry) {
            industryScore = 4;
        }
        else if (hotIndustries.some((k) => industry.includes(k))) {
            industryScore = industryMax;
        }
        const total = Math.min(100, ageScore + registeredCapitalScore + statusScore + riskScore + industryScore);
        const tags = [];
        if (age >= 5)
            tags.push(`成立${age}年`);
        if (registeredCapital >= 1000)
            tags.push(`注册资本${capMatch?.[0] ?? ''}`);
        if (industry && hotIndustries.some((k) => industry.includes(k)))
            tags.push('战略性行业');
        if (risk.riskLevel === 'low')
            tags.push('风险低');
        if (risk.riskLevel === 'high')
            tags.push('高风险');
        return {
            total,
            age: ageScore,
            ageMax,
            registeredCapital: registeredCapitalScore,
            registeredCapitalMax: 20,
            status: statusScore,
            statusMax,
            risk: riskScore,
            riskMax,
            industry: industryScore,
            industryMax,
            tags,
        };
    }
};
exports.TianyanchaService = TianyanchaService;
exports.TianyanchaService = TianyanchaService = TianyanchaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mcp_config_service_1.McpConfigService,
        volc_mcp_client_1.VolcMcpClient])
], TianyanchaService);
//# sourceMappingURL=tianyancha.service.js.map