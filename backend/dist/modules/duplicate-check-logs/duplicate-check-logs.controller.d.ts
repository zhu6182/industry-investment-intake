import { DuplicateCheckLogsService } from './duplicate-check-logs.service';
import { QueryLogDto } from './dto/query-log.dto';
export declare class DuplicateCheckLogsController {
    private readonly svc;
    constructor(svc: DuplicateCheckLogsService);
    query(params: QueryLogDto): Promise<{
        items: import("../../entities/duplicate-check-log.entity").DuplicateCheckLog[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: string): Promise<import("../../entities/duplicate-check-log.entity").DuplicateCheckLog>;
    summary(): Promise<{
        last30DaysCount: number;
        topDuplicatedCompanies: {
            companyName: any;
            count: number;
        }[];
        topCheckers: {
            checkerName: any;
            checkerPhone: any;
            count: number;
        }[];
    }>;
}
