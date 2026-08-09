import { IntakeService } from './intake.service';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { UpdateIntakeDto } from './dto/update-intake.dto';
import { QueryIntakeDto } from './dto/query-intake.dto';
import { CheckIntakeDto } from './dto/check-intake.dto';
import { ReviewIntakeDto } from './dto/review-intake.dto';
import { Repository } from 'typeorm';
import { DuplicateCheckLog } from '../../entities/duplicate-check-log.entity';
export declare class IntakeController {
    private readonly intakeService;
    private readonly dupLogRepo;
    private readonly logger;
    constructor(intakeService: IntakeService, dupLogRepo: Repository<DuplicateCheckLog>);
    create(dto: CreateIntakeDto, req: {
        user: any;
    }): Promise<import("../../entities/intake.entity").Intake>;
    findAll(query: QueryIntakeDto, req: {
        user: any;
    }): Promise<[import("../../entities/intake.entity").Intake[], number]>;
    findOne(id: string, req: {
        user: any;
    }): Promise<import("../../entities/intake.entity").Intake>;
    check(dto: CheckIntakeDto, req: {
        user: any;
        ip?: string;
    }): Promise<{
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
        readonly status: import("../../entities/intake.entity").IntakeStatus;
        readonly createdAt: Date;
        readonly applicantName: string;
        readonly applicantPhone: string;
        readonly assignedToName: string;
        readonly assignedToPhone: string;
    }>;
    update(id: string, dto: UpdateIntakeDto, req: {
        user: any;
    }): Promise<import("../../entities/intake.entity").Intake>;
    submit(id: string, req: {
        user: any;
    }): Promise<import("../../entities/intake.entity").Intake>;
    review(id: string, dto: ReviewIntakeDto, req: {
        user: any;
    }): Promise<{
        intake: import("../../entities/intake.entity").Intake;
        review: import("../../entities/review.entity").Review;
        reportGenerated: boolean;
        reportUrl: string | null;
    }>;
    getHistory(id: string): Promise<any[]>;
}
