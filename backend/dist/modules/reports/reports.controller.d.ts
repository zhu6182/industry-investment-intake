import type { Response } from 'express';
import { ReportGeneratorService } from './report-generator.service';
export declare class ReportsController {
    private readonly reportService;
    constructor(reportService: ReportGeneratorService);
    getByIntakeId(intakeId: string): Promise<import("../../entities/report.entity").Report>;
    download(intakeId: string, res: Response): Promise<void>;
}
