import { Repository } from 'typeorm';
import { FollowUp } from '../../entities/follow-up.entity';
import { IntakeService } from '../intakes/intake.service';
import type { CurrentUser } from '../intakes/intake.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { QueryFollowUpDto } from './dto/query-follow-up.dto';
export declare class FollowUpsService {
    private readonly followUpRepo;
    private readonly intakeService;
    constructor(followUpRepo: Repository<FollowUp>, intakeService: IntakeService);
    private isAdminOrManager;
    private hasTeamAccess;
    create(dto: CreateFollowUpDto, operator: CurrentUser): Promise<FollowUp>;
    findAll(query: QueryFollowUpDto, currentUser: CurrentUser): Promise<[FollowUp[], number]>;
    findMy(query: QueryFollowUpDto, currentUser: CurrentUser): Promise<[FollowUp[], number]>;
    findOne(id: number, currentUser: CurrentUser): Promise<FollowUp>;
    findByIntake(intakeId: number, currentUser: CurrentUser): Promise<FollowUp[]>;
    countMyThisMonth(currentUser: CurrentUser): Promise<number>;
}
