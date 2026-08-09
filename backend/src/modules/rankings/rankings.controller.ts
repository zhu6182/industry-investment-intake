import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/rankings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('by-count')
  @Roles('admin', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager', 'middleware_ops')
  rankByCount(@Query('limit') limit?: string) {
    return this.rankingsService.rankByCount(limit ? Number(limit) : 50);
  }

  @Get('by-area')
  @Roles('admin', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager', 'middleware_ops')
  rankByArea(@Query('limit') limit?: string) {
    return this.rankingsService.rankByArea(limit ? Number(limit) : 50);
  }

  @Get('me')
  @Roles('admin', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager', 'middleware_ops')
  getMyRank(@Req() req: { user: any } = { user: null }) {
    const uid = req.user?.id;
    return this.rankingsService.getMyRank(Number(uid));
  }
}
