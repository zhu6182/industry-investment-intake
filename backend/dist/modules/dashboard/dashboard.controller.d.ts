import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getTimeline(intakeId: string, req: {
        user: any;
    }): Promise<any[]>;
    getDashboardStats(req: {
        user: any;
    }): Promise<{
        pendingCount: number;
        myActiveCount: number;
        followUpThisMonth: number;
        visitThisMonth: number;
    }>;
    getTeamStats(req: {
        user: any;
    }): Promise<{
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
