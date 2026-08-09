import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { IntakeService } from './intake.service';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { UpdateIntakeDto } from './dto/update-intake.dto';
import { QueryIntakeDto } from './dto/query-intake.dto';
import { CheckIntakeDto } from './dto/check-intake.dto';
import { ReviewIntakeDto } from './dto/review-intake.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DuplicateCheckLog } from '../../entities/duplicate-check-log.entity';

const ALL_ROLES = [
  'admin',
  'middleware_ops',
  'investment_manager',
  'investment_staff',
  'channel_manager',
  'channel_specialist',
];

const INTAKE_CREATORS = [
  'admin',
  'channel_manager',
  'channel_specialist',
];

const INTAKE_EDITORS = [
  'admin',
  'channel_manager',
  'channel_specialist',
];

const INTAKE_REVIEWERS = [
  'admin',
  'middleware_ops',
  'investment_manager',
];

@Controller('api/intakes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntakeController {
  private readonly logger = new Logger(IntakeController.name);
  constructor(
    private readonly intakeService: IntakeService,
    @InjectRepository(DuplicateCheckLog)
    private readonly dupLogRepo: Repository<DuplicateCheckLog>,
  ) {}

  @Post()
  @Roles(...INTAKE_CREATORS)
  async create(
    @Body() dto: CreateIntakeDto,
    @Req() req: { user: any },
  ) {
    return this.intakeService.create(dto, req.user);
  }

  @Get()
  @Roles(...ALL_ROLES)
  async findAll(
    @Query() query: QueryIntakeDto,
    @Req() req: { user: any },
  ) {
    return this.intakeService.findAll(query, req.user);
  }

  @Get(':id')
  @Roles(...ALL_ROLES)
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: any },
  ) {
    return this.intakeService.findOne(Number(id), req.user);
  }

  @Post('check')
  @Roles(...ALL_ROLES)
  async check(
    @Body() dto: CheckIntakeDto,
    @Req() req: { user: any; ip?: string },
  ) {
    const result = await this.intakeService.checkExisting(dto.companyName);
    if (result.exists) {
      const u = req.user;
      this.logger.warn(
        `[查重命中] "${dto.companyName}" 命中进件 #${result.intakeId} (${result.status}, ${result.createdAt?.toISOString()}) - 查询人: ${u?.name} (id=${u?.id}, phone=${u?.phone}) at ${new Date().toISOString()}`,
      );
      try {
        await this.dupLogRepo.save({
          companyName: dto.companyName,
          intakeId: result.intakeId!,
          intakeCompanyName: result.companyName!,
          intakeStatus: result.status!,
          intakeCreatedAt: result.createdAt!,
          checkerId: u.id,
          checkerName: u.name,
          checkerPhone: u.phone,
          sourceIp: req.ip,
        });
      } catch (e: any) {
        this.logger.error(`[查重日志] 写入失败: ${e.message}`);
      }
    }
    return result;
  }

  @Patch(':id')
  @Roles(...INTAKE_EDITORS)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateIntakeDto,
    @Req() req: { user: any },
  ) {
    return this.intakeService.update(Number(id), dto, req.user);
  }

  @Post(':id/submit')
  @Roles(...INTAKE_CREATORS)
  async submit(
    @Param('id') id: string,
    @Req() req: { user: any },
  ) {
    return this.intakeService.submit(Number(id), req.user);
  }

  @Post(':id/review')
  @Roles(...INTAKE_REVIEWERS)
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewIntakeDto,
    @Req() req: { user: any },
  ) {
    return this.intakeService.review(
      Number(id),
      dto.action,
      dto.reason,
      dto.assignToUserId,
      req.user,
    );
  }

  @Get(':id/history')
  @Roles(...ALL_ROLES)
  async getHistory(@Param('id') id: string) {
    return this.intakeService.getStatusHistory(Number(id));
  }
}
