import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { McpConfigService, McpConfig } from './mcp-config.service';

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

/**
 * 火山 Agent Plan MCP 客户端
 * 协议: JSON-RPC 2.0 over HTTP POST
 * 端点: ${VOLC_MCP_URL} (默认 https://datapro.hqd.cn-beijing.volces.com/mcp)
 * Header: ${VOLC_MCP_HEADERS} (JSON)
 */
@Injectable()
export class VolcMcpClient {
  private readonly logger = new Logger(VolcMcpClient.name);

  constructor(
    private readonly config: ConfigService,
    private readonly mcpConfig: McpConfigService,
  ) {}

  private async getConfig(): Promise<McpConfig | null> {
    const cfg = await this.mcpConfig.getConfig();
    if (!cfg.enabled) return null;
    return cfg;
  }

  private async callRpc<T = any>(
    method: string,
    params: any = {},
    id = 1,
  ): Promise<T> {
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
          Accept: 'application/json, text/event-stream',
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
      // SSE 格式: event: message\ndata: {...}\n\n
      const dataLine = text
        .split(/\r?\n/)
        .find((l) => l.startsWith('data:'));
      const jsonStr = dataLine ? dataLine.slice(5).trim() : text;
      const data = JSON.parse(jsonStr);
      if (data.error) {
        throw new Error(`MCP RPC error: ${data.error.message || JSON.stringify(data.error)}`);
      }
      this.logger.debug(
        `[MCP] ${method} ok, ${latencyMs}ms, result keys=${Object.keys(data.result || {}).join(',')}`,
      );
      return data.result as T;
    } finally {
      clearTimeout(timer);
    }
  }

  async listTools(): Promise<any[]> {
    const r = await this.callRpc<any>('tools/list', {});
    return r?.tools || [];
  }

  /**
   * 调用 dataPro_search 工具，搜索企业工商信息
   * @param companyName 企业全称
   * @param extra 附加查询关键词，如 "工商信息" "公司公告" "股东" 等
   */
  async searchCompany(
    companyName: string,
    extra = '工商信息',
  ): Promise<McpCompanySearchResult> {
    const t0 = Date.now();
    const query = `${companyName} ${extra}`.trim();
    try {
      const result = await this.callRpc<any>('tools/call', {
        name: 'dataPro_search',
        arguments: { query },
      });
      const sc = result?.structuredContent || {};
      const rawItems: any[] = sc.items || [];
      const items: McpCompanyItem[] = rawItems
        .map((it) => this.normalizeCompany(it))
        .filter((it) => it.name);

      return {
        ok: true,
        source: 'mcp',
        datasetType: sc.dataset_type,
        total: items.length,
        items,
        latencyMs: Date.now() - t0,
        message:
          items.length > 0
            ? `✓ 通过火山 MCP 查询到 ${items.length} 条企业信息 (${sc.dataset_type || 'unknown'})`
            : '未查询到企业信息',
        query,
        raw: result,
      };
    } catch (e: any) {
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

  /**
   * 将 MCP 返回的中文 key 字段映射为统一结构
   */
  private normalizeCompany(it: Record<string, any>): McpCompanyItem {
    const get = (k1: string, k2?: string) =>
      it[k1] ?? (k2 ? it[k2] : undefined);

    return {
      companyId: get('公司ID', 'companyId'),
      name: get('公司名称', 'name') || '',
      legalPerson: get('法人姓名', 'legalPersonName'),
      creditCode: get('统一社会信用代码', 'creditCode'),
      status: get('企业状态', 'status'),
      registeredCapital: get('注册资金', 'registeredCapital'),
      registerAddress: get('注册地址', 'registerAddress'),
      establishDate: this.formatDate(
        get('成立日期', 'establishDate') || get('营业期限开始日期'),
      ),
      industry: get('所属行业', 'industryName') || get('行业代码', 'industry') || get('行业', 'industry'),
      scope: get('经营范围', 'scope'),
      registryAuthority: get('登记机关', 'registryAuthority'),
      province: get('注册地址', 'registerAddress')?.slice(0, 3),
      raw: it,
    };
  }

  private formatDate(v: any): string | undefined {
    if (!v) return undefined;
    const s = String(v);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : s;
  }
}
