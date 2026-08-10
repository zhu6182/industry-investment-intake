import { BiService } from './bi.service';
export declare class BiController {
    private readonly biService;
    constructor(biService: BiService);
    getAll(req: {
        user: any;
    }): Promise<{
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
        statusDistribution: {
            name: any;
            value: number;
        }[];
        trend: {
            dates: string[];
            created: number[];
            landed: number[];
        };
        industryDistribution: {
            name: any;
            value: number;
        }[];
        summary: {
            totalEnterprises: number;
            totalArea: number;
            landedCount: number;
            conversionRate: number;
            pendingCount: number;
            weekNewIntakes: number;
        };
    }>;
    getMap(req: {
        user: any;
    }): Promise<{
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
    getCity(provinceCode: string, req: {
        user: any;
    }): Promise<{
        cities: {
            name: string;
            code: string;
            enterpriseCount: number;
            totalArea: number;
            landedCount: number;
        }[];
        provinceName: string;
    }>;
    getStatus(req: {
        user: any;
    }): Promise<{
        name: any;
        value: number;
    }[]>;
    getTrend(days: string, req: {
        user: any;
    }): Promise<{
        dates: string[];
        created: number[];
        landed: number[];
    }>;
    getIndustry(req: {
        user: any;
    }): Promise<{
        name: any;
        value: number;
    }[]>;
    getSummary(req: {
        user: any;
    }): Promise<{
        totalEnterprises: number;
        totalArea: number;
        landedCount: number;
        conversionRate: number;
        pendingCount: number;
        weekNewIntakes: number;
    }>;
}
