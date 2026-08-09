import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DuplicateCheckLog } from '../../entities/duplicate-check-log.entity';
import { DuplicateCheckLogsService } from './duplicate-check-logs.service';
import { DuplicateCheckLogsController } from './duplicate-check-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DuplicateCheckLog])],
  controllers: [DuplicateCheckLogsController],
  providers: [DuplicateCheckLogsService],
})
export class DuplicateCheckLogsModule {}
