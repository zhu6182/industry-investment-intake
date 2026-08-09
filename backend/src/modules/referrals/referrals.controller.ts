import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/referrals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('mine')
  @Roles('admin', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager', 'middleware_ops')
  findMine(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req: { user: any } = { user: null },
  ) {
    const uid = req.user?.id;
    return this.referralsService.findByReferrer(
      Number(uid),
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get('mine/stats')
  @Roles('admin', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager', 'middleware_ops')
  getMyStats(@Req() req: { user: any } = { user: null }) {
    const uid = req.user?.id;
    return this.referralsService.getStats(Number(uid));
  }

  @Get()
  @Roles('admin', 'middleware_ops')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('referrerId') referrerId?: string,
  ) {
    return this.referralsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      referrerId: referrerId ? Number(referrerId) : undefined,
    });
  }
}
