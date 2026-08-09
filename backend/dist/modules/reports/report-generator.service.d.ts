import { Repository } from 'typeorm';
import { Report } from '../../entities/report.entity';
import { Intake } from '../../entities/intake.entity';
import { User } from '../../entities/user.entity';
import { DocumentParserService } from '../document-parser/document-parser.service';
export declare class ReportGeneratorService {
    private readonly reportRepo;
    private readonly parserService;
    private readonly logger;
    private readonly reportDir;
    private readonly baseUrl;
    private readonly fontDir;
    constructor(reportRepo: Repository<Report>, parserService: DocumentParserService);
    private ensureDir;
    private findChineseFont;
    generate(intake: Intake, assignTo?: User): Promise<Report>;
    private parseUploadedFiles;
    private buildSummary;
    private renderPdf;
    private writeChapterHeader;
    private writeInfoTable;
    private writeShareholderTable;
    private formatDate;
    findByIntakeId(intakeId: number): Promise<Report | null>;
    listByIntakeIds(intakeIds: number[]): Promise<Report[]>;
    requireByIntakeId(intakeId: number): Promise<Report>;
}
