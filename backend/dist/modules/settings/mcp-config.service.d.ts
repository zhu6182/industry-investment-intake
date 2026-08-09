import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Setting } from '../../entities/setting.entity';
export interface McpConfig {
    enabled: boolean;
    url: string;
    headers: Record<string, string>;
    timeoutMs: number;
    note: string;
}
export interface McpTestResult {
    ok: boolean;
    status?: number;
    statusText?: string;
    latencyMs: number;
    message: string;
    sample?: any;
    envSnapshot?: Record<string, string>;
}
export declare class McpConfigService implements OnModuleInit {
    private settingRepo;
    private readonly logger;
    constructor(settingRepo: Repository<Setting>);
    onModuleInit(): Promise<void>;
    getConfig(): Promise<McpConfig>;
    updateConfig(partial: Partial<McpConfig>): Promise<McpConfig>;
    exportToProcessEnv(cfg: McpConfig): void;
    getEnvSnapshot(): Record<string, string>;
    testConnection(partial?: Partial<McpConfig>): Promise<McpTestResult>;
    private getByKey;
    private setByKey;
}
