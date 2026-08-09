import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { McpConfigService, McpTestResult } from './mcp-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly mcpConfig: McpConfigService,
  ) {}

  @Get('report-template')
  @Roles('admin', 'middleware_ops')
  getReportTemplate() {
    return this.settingsService.getReportTemplate();
  }

  @Patch('report-template')
  @Roles('admin', 'middleware_ops')
  updateReportTemplate(@Body() body: any) {
    return this.settingsService.updateReportTemplate(body);
  }

  @Get('volcengine-mcp')
  @Roles('admin', 'middleware_ops')
  getMcpConfig() {
    return this.mcpConfig.getConfig();
  }

  @Put('volcengine-mcp')
  @Roles('admin', 'middleware_ops')
  updateMcpConfig(@Body() body: any) {
    return this.mcpConfig.updateConfig(body);
  }

  @Post('volcengine-mcp/test')
  @Roles('admin', 'middleware_ops')
  testMcpConnection(@Body() body: any): Promise<McpTestResult> {
    return this.mcpConfig.testConnection(body);
  }
}
