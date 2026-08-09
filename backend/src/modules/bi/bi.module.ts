import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Intake } from '../../entities/intake.entity';
import { Region } from '../../entities/region.entity';
import { Visit } from '../../entities/visit.entity';
import { BiController } from './bi.controller';
import { BiService } from './bi.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Intake, Region, Visit]),
  ],
  controllers: [BiController],
  providers: [BiService],
})
export class BiModule {}
