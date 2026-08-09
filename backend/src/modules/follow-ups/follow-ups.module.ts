import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUp } from '../../entities/follow-up.entity';
import { User } from '../../entities/user.entity';
import { FollowUpsController } from './follow-ups.controller';
import { FollowUpsService } from './follow-ups.service';
import { IntakesModule } from '../intakes/intake.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FollowUp, User]),
    IntakesModule,
  ],
  controllers: [FollowUpsController],
  providers: [FollowUpsService],
  exports: [FollowUpsService],
})
export class FollowUpsModule {}
