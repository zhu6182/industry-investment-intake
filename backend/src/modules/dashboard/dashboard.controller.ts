import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const ALL_ROLES = [
  'admin',
  'middleware_ops',
  'investment_manager',
  'investment_staff',
  'channel_manager',
  'channel_specialist',
];

const TEAM_ROLES = [
  'admin',
  'middleware_ops',
  'investment_manager',
  'channel_manager',
];

@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('timeline/:intakeId')
  @Roles(...ALL_ROLES)
  async getTimeline(
    @Param('intakeId') intakeId: string,
    @Req() req: { user: any },
  ) {
    return this.dashboardService.getTimeline(Number(intakeId), req.user);
  }

  @Get('stats/dashboard')
  @Roles(...ALL_ROLES)
  async getDashboardStats(@Req() req: { user: any }) {
    return this.dashboardService.getDashboardStats(req.user);
  }

  @Get('stats/team')
  @Roles(...TEAM_ROLES)
  async getTeamStats(@Req() req: { user: any }) {
    return this.dashboardService.getTeamStats(req.user);
  }
}
