import { request } from '../../utils/request';

export function getReportTemplate() {
  return request<any>({ url: '/api/settings/report-template', method: 'get' });
}

export function updateReportTemplate(data: any) {
  return request<any>({ url: '/api/settings/report-template', method: 'patch', data });
}

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

export function getMcpConfig() {
  return request<McpConfig>({ url: '/api/settings/volcengine-mcp', method: 'get' });
}

export function updateMcpConfig(data: Partial<McpConfig>) {
  return request<McpConfig>({ url: '/api/settings/volcengine-mcp', method: 'put', data });
}

export function testMcpConnection(data?: Partial<McpConfig>) {
  return request<McpTestResult>({ url: '/api/settings/volcengine-mcp/test', method: 'post', data: data || {} });
}
