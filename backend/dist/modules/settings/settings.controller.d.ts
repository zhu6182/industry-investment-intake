import { SettingsService } from './settings.service';
import { McpConfigService, McpTestResult } from './mcp-config.service';
export declare class SettingsController {
    private readonly settingsService;
    private readonly mcpConfig;
    constructor(settingsService: SettingsService, mcpConfig: McpConfigService);
    getReportTemplate(): Promise<any>;
    updateReportTemplate(body: any): Promise<any>;
    getMcpConfig(): Promise<import("./mcp-config.service").McpConfig>;
    updateMcpConfig(body: any): Promise<import("./mcp-config.service").McpConfig>;
    testMcpConnection(body: any): Promise<McpTestResult>;
}
