import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  VolcMcpClient,
  McpCompanySearchResult,
} from './volc-mcp.client';
import { McpConfigService } from './mcp-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

interface SearchBody {
  name: string;
  extra?: string;
}

@Controller('api/mcp')
@UseGuards(JwtAuthGuard, RolesGuard)
export class McpController {
  constructor(
    private readonly mcpClient: VolcMcpClient,
    private readonly mcpConfig: McpConfigService,
  ) {}

  @Get('status')
  @Roles('admin', 'middleware_ops', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager')
  async status() {
    const cfg = await this.mcpConfig.getConfig();
    return {
      enabled: cfg.enabled,
      url: cfg.url,
      configured: !!cfg.headers['X-Agent-Plan-Key'],
    };
  }

  @Get('tools')
  @Roles('admin', 'middleware_ops')
  async listTools() {
    try {
      const tools = await this.mcpClient.listTools();
      return { ok: true, tools };
    } catch (e: any) {
      return { ok: false, message: e.message, tools: [] };
    }
  }

  @Post('company/search')
  @Roles('admin', 'middleware_ops', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager')
  async searchCompany(@Body() body: SearchBody): Promise<McpCompanySearchResult> {
    const name = (body.name || '').trim();
    if (!name) {
      return {
        ok: false,
        source: 'error',
        total: 0,
        items: [],
        latencyMs: 0,
        message: '企业名称不能为空',
        query: '',
      };
    }
    return this.mcpClient.searchCompany(name, body.extra);
  }
}
