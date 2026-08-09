import { Repository } from 'typeorm';
import { Visit } from '../../entities/visit.entity';
import { Intake } from '../../entities/intake.entity';
import { IntakeService } from '../intakes/intake.service';
import type { CurrentUser } from '../intakes/intake.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { QueryVisitDto } from './dto/query-visit.dto';
export declare class VisitsService {
    private readonly visitRepo;
    private readonly intakeRepo;
    private readonly intakeService;
    constructor(visitRepo: Repository<Visit>, intakeRepo: Repository<Intake>, intakeService: IntakeService);
    private isAdminOrManager;
    create(dto: CreateVisitDto, operator: CurrentUser): Promise<Visit>;
    findAll(query: QueryVisitDto, currentUser: CurrentUser): Promise<[Visit[], number]>;
    findMy(query: QueryVisitDto, currentUser: CurrentUser): Promise<[Visit[], number]>;
    findOne(id: number, currentUser: CurrentUser): Promise<Visit>;
    findByIntake(intakeId: number, currentUser: CurrentUser): Promise<Visit[]>;
    countMyThisMonth(currentUser: CurrentUser): Promise<number>;
}
