import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Intake } from '../../entities/intake.entity';
import { IntakeFile } from '../../entities/intake-file.entity';
import { User } from '../../entities/user.entity';
import { Review } from '../../entities/review.entity';
import { DuplicateCheckLog } from '../../entities/duplicate-check-log.entity';
import { IntakeController } from './intake.controller';
import { IntakeService } from './intake.service';
import { TianyanchaModule } from '../tianyancha/tianyancha.module';
import { ReportsModule } from '../reports/reports.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Intake, IntakeFile, User, Review, DuplicateCheckLog]),
    TianyanchaModule,
    ReportsModule,
    ReferralsModule,
  ],
  controllers: [IntakeController],
  providers: [IntakeService],
  exports: [IntakeService],
})
export class IntakesModule {}
