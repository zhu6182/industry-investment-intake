import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visit } from '../../entities/visit.entity';
import { Intake } from '../../entities/intake.entity';
import { User } from '../../entities/user.entity';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { IntakesModule } from '../intakes/intake.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Visit, Intake, User]),
    IntakesModule,
  ],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}
