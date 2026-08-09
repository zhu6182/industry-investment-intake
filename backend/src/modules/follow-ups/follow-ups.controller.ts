import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FollowUpsService } from './follow-ups.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { QueryFollowUpDto } from './dto/query-follow-up.dto';
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

@Controller('api/follow-ups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Post()
  @Roles(...ALL_ROLES)
  async create(
    @Body() dto: CreateFollowUpDto,
    @Req() req: { user: any },
  ) {
    return this.followUpsService.create(dto, req.user);
  }

  @Get()
  @Roles(...ALL_ROLES)
  async findAll(
    @Query() query: QueryFollowUpDto,
    @Req() req: { user: any },
  ) {
    if (query.intakeId) {
      return this.followUpsService.findByIntake(Number(query.intakeId), req.user);
    }
    return this.followUpsService.findAll(query, req.user);
  }

  @Get('my')
  @Roles(...ALL_ROLES)
  async findMy(
    @Query() query: QueryFollowUpDto,
    @Req() req: { user: any },
  ) {
    return this.followUpsService.findMy(query, req.user);
  }

  @Get(':id')
  @Roles(...ALL_ROLES)
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: any },
  ) {
    return this.followUpsService.findOne(Number(id), req.user);
  }
}
