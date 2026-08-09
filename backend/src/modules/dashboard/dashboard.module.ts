import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Intake } from '../../entities/intake.entity';
import { Review } from '../../entities/review.entity';
import { Report } from '../../entities/report.entity';
import { FollowUpsModule } from '../follow-ups/follow-ups.module';
import { VisitsModule } from '../visits/visits.module';
import { IntakesModule } from '../intakes/intake.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Intake, Review, Report]),
    FollowUpsModule,
    VisitsModule,
    IntakesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
