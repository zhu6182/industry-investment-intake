import { Repository } from 'typeorm';
import { Intake } from '../../entities/intake.entity';
import { Review } from '../../entities/review.entity';
import { Report } from '../../entities/report.entity';
import { IntakeService } from '../intakes/intake.service';
import type { CurrentUser } from '../intakes/intake.service';
import { FollowUpsService } from '../follow-ups/follow-ups.service';
import { VisitsService } from '../visits/visits.service';
export declare class DashboardService {
    private readonly intakeRepo;
    private readonly reviewRepo;
    private readonly reportRepo;
    private readonly intakeService;
    private readonly followUpsService;
    private readonly visitsService;
    constructor(intakeRepo: Repository<Intake>, reviewRepo: Repository<Review>, reportRepo: Repository<Report>, intakeService: IntakeService, followUpsService: FollowUpsService, visitsService: VisitsService);
    getTimeline(intakeId: number, currentUser: CurrentUser): Promise<any[]>;
    getDashboardStats(currentUser: CurrentUser): Promise<{
        pendingCount: number;
        myActiveCount: number;
        followUpThisMonth: number;
        visitThisMonth: number;
    }>;
    getTeamStats(currentUser: CurrentUser): Promise<{
        members: never[];
        totalFollowUps: number;
        totalVisits: number;
        totalIntakes?: undefined;
        startOfMonth?: undefined;
        isManager?: undefined;
        memberSummary?: undefined;
    } | {
        totalIntakes: number;
        startOfMonth: Date;
        isManager: boolean;
        memberSummary: {
            intakeId: number;
            companyName: string;
            status: import("../../entities/intake.entity").IntakeStatus;
            area: number;
            assignedToId: any;
        }[];
        members?: undefined;
        totalFollowUps?: undefined;
        totalVisits?: undefined;
    }>;
}
