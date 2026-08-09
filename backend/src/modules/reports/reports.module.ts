import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from '../../entities/report.entity';
import { ReportsController } from './reports.controller';
import { ReportGeneratorService } from './report-generator.service';
import { DocumentParserModule } from '../document-parser/document-parser.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report]), DocumentParserModule],
  controllers: [ReportsController],
  providers: [ReportGeneratorService],
  exports: [ReportGeneratorService],
})
export class ReportsModule {}
