import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as https from 'https';
import Redis from 'ioredis';
import dayjs from 'dayjs';
import {
  CompanyDetail,
  CompanySearchResult,
  RatingBreakdown,
  RiskInfo,
  Shareholder,
  TycApiResponse,
  ValidationResult,
} from './interfaces/tyc-response.interface';
import { McpConfigService } from '../settings/mcp-config.service';
import { VolcMcpClient } from '../settings/volc-mcp.client';

export interface TianyanchaConfig {
  appKey: string;
  secretKey: string;
  baseUrl: string;
  cacheTtl: number;
  requestTimeout: number;
}

export const TYC_INVALID_STATUS_KEYWORDS = ['注销', '吊销', '在途执行', '在途'];

@Injectable()
export class TianyanchaService {
  private readonly logger = new Logger(TianyanchaService.name);
  private readonly config: TianyanchaConfig;
  private redis: Redis | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly mcpConfig: McpConfigService,
    private readonly mcpClient: VolcMcpClient,
  ) {
    this.config = this.configService.get<TianyanchaConfig>('tianyancha')!;
    this.logger.log('[企业查询] 统一走火山 Agent Plan MCP 真实数据源');

    const redisHost = this.configService.get<string>('redis.host', 'localhost');
    const redisPort = this.configService.get<number>('redis.port', 6379);
    const redisEnabled = this.configService.get<boolean>('redis.enabled', false);

    if (redisEnabled) {
      try {
        this.redis = new Redis({
          host: redisHost,
          port: redisPort,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableReadyCheck: false,
          retryStrategy: () => null, // 不自动重连
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
      } catch (err) {
        this.logger.warn(`Redis init failed, caching disabled: ${(err as Error).message}`);
        this.redis = null;
      }
    }
  }

  private sign(timestamp: string, nonce: string): string {
    const signStr = `${timestamp}${nonce}${this.config.appKey}`;
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(signStr)
      .digest('base64');
  }

  private randomNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private cacheKey(action: string, name: string): string {
    return `tyc:${action}:${name}`;
  }

  private async cacheGet<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      const raw = await this.redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(`Redis get error: ${(err as Error).message}`);
      return null;
    }
  }

  private async cacheSet<T>(key: string, value: T): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        this.config.cacheTtl,
      );
    } catch (err) {
      this.logger.warn(`Redis set error: ${(err as Error).message}`);
    }
  }

  private request<T>(
    path: string,
    params: Record<string, string | number>,
  ): Promise<T | null> {
    return new Promise((resolve) => {
      const timestamp = String(Date.now());
      const nonce = this.randomNonce();
      const sign = this.sign(timestamp, nonce);

      const query = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(params).map(([k, v]) => [k, String(v)]),
        ),
        appkey: this.config.appKey,
        timestamp,
        nonce,
        sign,
      }).toString();

      const url = `${this.config.baseUrl}${path}?${query}`;

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch (err) {
        this.logger.error(`Invalid TYC URL: ${(err as Error).message}`);
        resolve(null);
        return;
      }

      const options: https.RequestOptions = {
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
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const json = JSON.parse(body) as TycApiResponse<T>;
              if (
                json.state === 'ok' ||
                json.state === '200' ||
                json.state === 200 ||
                (json.state as unknown as number) === 1
              ) {
                resolve(json.data as T);
              } else {
                this.logger.warn(
                  `TYC API error: state=${json.state}, msg=${json.errorMsg ?? ''}`,
                );
                resolve(null);
              }
            } catch (err) {
              this.logger.error(`TYC JSON parse error: ${(err as Error).message}`);
              resolve(null);
            }
          } else {
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

  async searchCompany(name: string): Promise<CompanySearchResult[]> {
    const cacheKey = this.cacheKey('search', name);
    const cached = await this.cacheGet<CompanySearchResult[]>(cacheKey);
    if (cached) return cached;

    const mcp = await this.mcpClient.searchCompany(name);
    const results: CompanySearchResult[] = mcp.items.map((it) => ({
      id: (it.companyId ?? '') as string | number,
      name: it.name,
      creditCode: it.creditCode || '',
      legalPersonName: it.legalPerson || '',
      startDate: it.establishDate || '',
      status: it.status || '',
    }));

    await this.cacheSet(cacheKey, results);
    return results;
  }

  async getCompanyDetail(companyName: string): Promise<CompanyDetail | null> {
    const cacheKey = this.cacheKey('detail', companyName);
    const cached = await this.cacheGet<CompanyDetail>(cacheKey);
    if (cached) return cached;

    // 唯一数据源: 火山 Agent Plan MCP
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

    const detail: CompanyDetail = {
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

  private riskCache = new Map<string, RiskInfo>();

  async validateAndEnrich(companyName: string): Promise<ValidationResult> {
    const reasons: string[] = [];
    const emptyResult: ValidationResult = {
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
    const isRevoked = TYC_INVALID_STATUS_KEYWORDS.some((kw) =>
      status.includes(kw),
    );
    if (isRevoked) {
      reasons.push(`企业状态异常：${status}`);
    }

    let years = 0;
    if (detail.startDate) {
      const start = dayjs(detail.startDate);
      if (start.isValid()) {
        years = Math.max(0, dayjs().diff(start, 'year'));
        if (years < 2) {
          reasons.push(`企业成立不足 2 年（${years} 年）`);
        }
      } else {
        reasons.push('无法识别企业成立时间');
      }
    } else {
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

  private evaluateRisk(detail: CompanyDetail): RiskInfo {
    const cached = this.riskCache.get(detail.name);
    if (cached) {
      this.riskCache.delete(detail.name);
      return cached;
    }

    const status = detail.status ?? '';
    const isRevoked = TYC_INVALID_STATUS_KEYWORDS.some((kw) =>
      status.includes(kw),
    );

    return {
      hasExecution: false,
      hasDishonesty: false,
      hasLawsuit: false,
      isRevoked,
      executionCount: 0,
      riskLevel: isRevoked ? 'high' : 'low',
    };
  }

  private calculateRating(
    detail: CompanyDetail,
    years: number,
    risk: RiskInfo,
  ): RatingBreakdown {
    const ageMax = 30;
    const age = Math.min(years, ageMax);
    const ageScore = Math.round((age / ageMax) * 25);

    const capMatch = (detail.registeredCapital ?? '').match(/(\d+(?:\.\d+)?)/);
    const capitalNum = capMatch ? parseFloat(capMatch[1]) : 0;
    const capMax = 10000;
    const registeredCapital = Math.min(capitalNum, capMax);
    const registeredCapitalScore = Math.round(
      (registeredCapital / capMax) * 20,
    );

    const statusMax = 20;
    let statusScore = statusMax;
    if (risk.isRevoked) statusScore = 0;
    else if (risk.riskLevel === 'high') statusScore = 4;
    else if (risk.riskLevel === 'medium') statusScore = 10;

    const riskMax = 15;
    let riskScore = riskMax;
    if (risk.hasExecution) riskScore = 0;
    else if (risk.hasDishonesty) riskScore = 0;
    else if (risk.hasLawsuit) riskScore = 6;

    const industryMax = 10;
    let industryScore = industryMax;
    const hotIndustries = [
      '科技', '信息技术', '互联网', '软件', '半导体', '集成电路', '新能源',
      '生物医药', '高端装备', '智能制造', '新材料',
    ];
    const industry = detail.industry ?? '';
    if (!industry) {
      industryScore = 4;
    } else if (hotIndustries.some((k) => industry.includes(k))) {
      industryScore = industryMax;
    }

    const total = Math.min(
      100,
      ageScore + registeredCapitalScore + statusScore + riskScore + industryScore,
    );

    const tags: string[] = [];
    if (age >= 5) tags.push(`成立${age}年`);
    if (registeredCapital >= 1000) tags.push(`注册资本${capMatch?.[0] ?? ''}`);
    if (industry && hotIndustries.some((k) => industry.includes(k))) tags.push('战略性行业');
    if (risk.riskLevel === 'low') tags.push('风险低');
    if (risk.riskLevel === 'high') tags.push('高风险');

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
}
