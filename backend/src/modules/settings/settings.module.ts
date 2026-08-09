import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { McpConfigService } from './mcp-config.service';
import { McpController } from './mcp.controller';
import { VolcMcpClient } from './volc-mcp.client';
import { Setting } from '../../entities/setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  controllers: [SettingsController, McpController],
  providers: [SettingsService, McpConfigService, VolcMcpClient],
  exports: [SettingsService, McpConfigService, VolcMcpClient],
})
export class SettingsModule {}
