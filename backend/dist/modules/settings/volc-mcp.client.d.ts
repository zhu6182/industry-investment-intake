import { ConfigService } from '@nestjs/config';
import { McpConfigService } from './mcp-config.service';
export interface McpCompanyItem {
    companyId?: number | string;
    name: string;
    legalPerson?: string;
    creditCode?: string;
    status?: string;
    registeredCapital?: string;
    registerAddress?: string;
    establishDate?: string;
    industry?: string;
    scope?: string;
    registryAuthority?: string;
    province?: string;
    raw: Record<string, any>;
}
export interface McpCompanySearchResult {
    ok: boolean;
    source: 'mcp' | 'unconfigured' | 'error';
    datasetType?: string;
    total: number;
    items: McpCompanyItem[];
    latencyMs: number;
    message: string;
    query: string;
    raw?: any;
}
export declare class VolcMcpClient {
    private readonly config;
    private readonly mcpConfig;
    private readonly logger;
    constructor(config: ConfigService, mcpConfig: McpConfigService);
    private getConfig;
    private callRpc;
    listTools(): Promise<any[]>;
    searchCompany(companyName: string, extra?: string): Promise<McpCompanySearchResult>;
    private normalizeCompany;
    private formatDate;
}
