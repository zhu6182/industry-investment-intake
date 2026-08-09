import { Repository } from 'typeorm';
import { DuplicateCheckLog } from '../../entities/duplicate-check-log.entity';
import { QueryLogDto } from './dto/query-log.dto';
export declare class DuplicateCheckLogsService {
    private readonly repo;
    constructor(repo: Repository<DuplicateCheckLog>);
    query(params: QueryLogDto): Promise<{
        items: DuplicateCheckLog[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: number): Promise<DuplicateCheckLog>;
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
