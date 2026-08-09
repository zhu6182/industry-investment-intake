import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportGeneratorService } from './report-generator.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const REPORT_ROLES = [
  'admin',
  'middleware_ops',
  'investment_manager',
];

@Controller('api/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...REPORT_ROLES)
export class ReportsController {
  constructor(private readonly reportService: ReportGeneratorService) {}

  @Get(':intakeId')
  async getByIntakeId(@Param('intakeId') intakeId: string) {
    const id = Number(intakeId);
    if (Number.isNaN(id)) {
      throw new HttpException('无效的进件ID', HttpStatus.BAD_REQUEST);
    }
    const report = await this.reportService.requireByIntakeId(id);
    return report;
  }

  @Get(':intakeId/download')
  async download(
    @Param('intakeId') intakeId: string,
    @Res() res: Response,
  ) {
    const id = Number(intakeId);
    if (Number.isNaN(id)) {
      throw new HttpException('无效的进件ID', HttpStatus.BAD_REQUEST);
    }
    const report = await this.reportService.requireByIntakeId(id);
    res.download(report.pdfPath);
  }
}
