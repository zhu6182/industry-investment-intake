import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TianyanchaService } from './tianyancha.service';
import { TianyanchaController, IntakeLookupService } from './tianyancha.controller';
import { Intake } from '../../entities/intake.entity';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Intake]), SettingsModule],
  controllers: [TianyanchaController],
  providers: [TianyanchaService, IntakeLookupService],
  exports: [TianyanchaService],
})
export class TianyanchaModule {}

export { IntakeLookupService };
