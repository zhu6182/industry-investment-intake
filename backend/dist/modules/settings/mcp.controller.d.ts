import { VolcMcpClient, McpCompanySearchResult } from './volc-mcp.client';
import { McpConfigService } from './mcp-config.service';
interface SearchBody {
    name: string;
    extra?: string;
}
export declare class McpController {
    private readonly mcpClient;
    private readonly mcpConfig;
    constructor(mcpClient: VolcMcpClient, mcpConfig: McpConfigService);
    status(): Promise<{
        enabled: boolean;
        url: string;
        configured: boolean;
    }>;
    listTools(): Promise<{
        ok: boolean;
        tools: any[];
        message?: undefined;
    } | {
        ok: boolean;
        message: any;
        tools: never[];
    }>;
    searchCompany(body: SearchBody): Promise<McpCompanySearchResult>;
}
export {};
