import { ConfigService } from '@nestjs/config';
import { CompanyDetail, CompanySearchResult, ValidationResult } from './interfaces/tyc-response.interface';
import { McpConfigService } from '../settings/mcp-config.service';
import { VolcMcpClient } from '../settings/volc-mcp.client';
export interface TianyanchaConfig {
    appKey: string;
    secretKey: string;
    baseUrl: string;
    cacheTtl: number;
    requestTimeout: number;
}
export declare const TYC_INVALID_STATUS_KEYWORDS: string[];
export declare class TianyanchaService {
    private readonly configService;
    private readonly mcpConfig;
    private readonly mcpClient;
    private readonly logger;
    private readonly config;
    private redis;
    constructor(configService: ConfigService, mcpConfig: McpConfigService, mcpClient: VolcMcpClient);
    private sign;
    private randomNonce;
    private cacheKey;
    private cacheGet;
    private cacheSet;
    private request;
    searchCompany(name: string): Promise<CompanySearchResult[]>;
    getCompanyDetail(companyName: string): Promise<CompanyDetail | null>;
    private riskCache;
    validateAndEnrich(companyName: string): Promise<ValidationResult>;
    private evaluateRisk;
    private calculateRating;
}
