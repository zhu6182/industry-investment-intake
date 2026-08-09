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
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { QueryVisitDto } from './dto/query-visit.dto';
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

@Controller('api/visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @Roles(...ALL_ROLES)
  async create(
    @Body() dto: CreateVisitDto,
    @Req() req: { user: any },
  ) {
    return this.visitsService.create(dto, req.user);
  }

  @Get()
  @Roles(...ALL_ROLES)
  async findAll(
    @Query() query: QueryVisitDto,
    @Req() req: { user: any },
  ) {
    if (query.intakeId) {
      return this.visitsService.findByIntake(Number(query.intakeId), req.user);
    }
    return this.visitsService.findAll(query, req.user);
  }

  @Get('my')
  @Roles(...ALL_ROLES)
  async findMy(
    @Query() query: QueryVisitDto,
    @Req() req: { user: any },
  ) {
    return this.visitsService.findMy(query, req.user);
  }

  @Get(':id')
  @Roles(...ALL_ROLES)
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: any },
  ) {
    return this.visitsService.findOne(Number(id), req.user);
  }
}
