import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BiService } from './bi.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const BI_ROLES = [
  'admin',
  'middleware_ops',
  'investment_manager',
  'channel_manager',
];

@Controller('api/bi')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...BI_ROLES)
export class BiController {
  constructor(private readonly biService: BiService) {}

  @Get('map')
  async getMap(@Req() req: { user: any }) {
    return this.biService.getMapData(req.user);
  }

  @Get('map/city')
  async getCity(
    @Query('provinceCode') provinceCode: string,
    @Req() req: { user: any },
  ) {
    return this.biService.getCityData(provinceCode, req.user);
  }

  @Get('status')
  async getStatus(@Req() req: { user: any }) {
    return this.biService.getStatusDistribution(req.user);
  }

  @Get('trend')
  async getTrend(
    @Query('days') days: string,
    @Req() req: { user: any },
  ) {
    return this.biService.getTrendData(req.user, Number(days) || 30);
  }

  @Get('industry')
  async getIndustry(@Req() req: { user: any }) {
    return this.biService.getIndustryDistribution(req.user);
  }

  @Get('summary')
  async getSummary(@Req() req: { user: any }) {
    return this.biService.getSummary(req.user);
  }
}
