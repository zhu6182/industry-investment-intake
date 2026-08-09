import { Repository, DataSource } from 'typeorm';
import { Intake, IntakeStatus } from '../../entities/intake.entity';
import { IntakeFile } from '../../entities/intake-file.entity';
import { User } from '../../entities/user.entity';
import { Review } from '../../entities/review.entity';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { UpdateIntakeDto } from './dto/update-intake.dto';
import { QueryIntakeDto } from './dto/query-intake.dto';
import { TianyanchaService } from '../tianyancha/tianyancha.service';
import { ReportGeneratorService } from '../reports/report-generator.service';
import { ReferralsService } from '../referrals/referrals.service';
export interface CurrentUser {
    id: number;
    roles?: Array<{
        code: string;
        dataScope: string;
    }>;
    regionId?: number;
}
export declare class IntakeService {
    private readonly intakeRepo;
    private readonly fileRepo;
    private readonly reviewRepo;
    private readonly userRepo;
    private readonly dataSource;
    private readonly tianyanchaService;
    private readonly reportService;
    private readonly referralsService;
    constructor(intakeRepo: Repository<Intake>, fileRepo: Repository<IntakeFile>, reviewRepo: Repository<Review>, userRepo: Repository<User>, dataSource: DataSource, tianyanchaService: TianyanchaService, reportService: ReportGeneratorService, referralsService: ReferralsService);
    private getUserDataScope;
    private getUserRoleCodes;
    private applyDataScopeFilter;
    checkExisting(companyName: string, excludeId?: number): Promise<{
        readonly exists: false;
        readonly intakeId?: undefined;
        readonly companyName?: undefined;
        readonly status?: undefined;
        readonly createdAt?: undefined;
        readonly applicantName?: undefined;
        readonly applicantPhone?: undefined;
        readonly assignedToName?: undefined;
        readonly assignedToPhone?: undefined;
    } | {
        readonly exists: true;
        readonly intakeId: number;
        readonly companyName: string;
        readonly status: IntakeStatus;
        readonly createdAt: Date;
        readonly applicantName: string;
        readonly applicantPhone: string;
        readonly assignedToName: string;
        readonly assignedToPhone: string;
    }>;
    create(dto: CreateIntakeDto, applicantUser: CurrentUser): Promise<Intake>;
    findAll(query: QueryIntakeDto, currentUser: CurrentUser): Promise<[Intake[], number]>;
    findOne(id: number, currentUser: CurrentUser): Promise<Intake>;
    update(id: number, dto: UpdateIntakeDto, currentUser: CurrentUser): Promise<Intake>;
    submit(id: number, currentUser: CurrentUser): Promise<Intake>;
    addFiles(intakeId: number, filesData: Array<{
        type: string;
        url: string;
        originalName: string;
        storedName: string;
        size: number;
    }>): Promise<IntakeFile[]>;
    review(id: number, action: 'approve' | 'reject', reason: string | undefined, assignToUserId: number | undefined, reviewer: CurrentUser): Promise<{
        intake: Intake;
        review: Review;
        reportGenerated: boolean;
        reportUrl: string | null;
    }>;
    getStatusHistory(id: number): Promise<any[]>;
    updateStatus(id: number, newStatus: IntakeStatus, operator: CurrentUser): Promise<Intake>;
}
