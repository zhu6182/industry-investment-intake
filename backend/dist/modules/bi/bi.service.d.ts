import { Repository } from 'typeorm';
import { Intake } from '../../entities/intake.entity';
import { Region } from '../../entities/region.entity';
import { Visit } from '../../entities/visit.entity';
import { CurrentUser } from '../intakes/intake.service';
export declare class BiService {
    private readonly intakeRepo;
    private readonly regionRepo;
    private readonly visitRepo;
    constructor(intakeRepo: Repository<Intake>, regionRepo: Repository<Region>, visitRepo: Repository<Visit>);
    private getUserDataScope;
    private getUserRoleCodes;
    private applyDataScopeFilter;
    private applyVisitScopeFilter;
    getMapData(currentUser: CurrentUser): Promise<{
        provinces: {
            name: string;
            code: string;
            enterpriseCount: number;
            totalArea: number;
            landedCount: number;
        }[];
        totals: {
            totalEnterprises: number;
            totalArea: number;
            totalLanded: number;
            conversionRate: number;
        };
        recent30days: {
            created: number;
            approved: number;
            visited: number;
        };
    }>;
    getCityData(provinceCode: string, currentUser: CurrentUser): Promise<{
        cities: {
            name: string;
            code: string;
            enterpriseCount: number;
            totalArea: number;
            landedCount: number;
        }[];
        provinceName: string;
    }>;
    getStatusDistribution(currentUser: CurrentUser): Promise<{
        name: string;
        value: number;
    }[]>;
    getTrendData(currentUser: CurrentUser, days?: number): Promise<{
        dates: string[];
        created: number[];
        landed: number[];
    }>;
    getIndustryDistribution(currentUser: CurrentUser): Promise<{
        name: string;
        value: number;
    }[]>;
    getSummary(currentUser: CurrentUser): Promise<{
        totalEnterprises: number;
        totalArea: number;
        landedCount: number;
        conversionRate: number;
        pendingCount: number;
        weekNewIntakes: number;
    }>;
}
