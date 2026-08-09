import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TianyanchaService } from './tianyancha.service';
import { QueryCompanyDto } from './dto/query-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Module } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Intake } from '../../entities/intake.entity';
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

@Injectable()
export class IntakeLookupService {
  constructor(
    @InjectRepository(Intake)
    private readonly intakeRepo: Repository<Intake>,
  ) {}

  async checkExisting(companyName: string): Promise<boolean> {
    const qb = this.intakeRepo.createQueryBuilder('i');
    qb.where('i.companyName = :companyName', { companyName });
    qb.andWhere('i.status IN (:...activeStatuses)', {
      activeStatuses: ['pending', 'approved', 'assigned', 'following'],
    });
    const count = await qb.getCount();
    return count > 0;
  }
}

@Module({
  providers: [IntakeLookupService],
  exports: [IntakeLookupService],
})
export class IntakeLookupModule {}

@Controller('api/tyc')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ALL_ROLES)
export class TianyanchaController {
  constructor(
    private readonly tycService: TianyanchaService,
    private readonly intakeLookup: IntakeLookupService,
  ) {}

  @Post('search')
  async search(@Body() dto: QueryCompanyDto) {
    const list = await this.tycService.searchCompany(dto.name);
    return { total: list.length, items: list };
  }

  @Post('validate')
  async validate(@Body() dto: QueryCompanyDto) {
    return this.tycService.validateAndEnrich(dto.name);
  }

  @Post('lookup')
  async lookup(@Body() dto: QueryCompanyDto) {
    const [validation, exists] = await Promise.all([
      this.tycService.validateAndEnrich(dto.name),
      this.intakeLookup.checkExisting(dto.name).catch(() => false),
    ]);
    return {
      exists,
      canProceed: !exists,
      ...validation,
    };
  }
}
