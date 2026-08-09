import { request } from '../../utils/request';

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
  raw?: any;
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
}

export function getMcpStatus() {
  return request<{ enabled: boolean; url: string; configured: boolean }>({
    url: '/api/mcp/status',
    method: 'get',
  });
}

export function searchMcpCompany(name: string, extra?: string) {
  return request<McpCompanySearchResult>({
    url: '/api/mcp/company/search',
    method: 'post',
    data: { name, extra },
  });
}
