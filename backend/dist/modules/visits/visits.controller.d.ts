import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { QueryVisitDto } from './dto/query-visit.dto';
export declare class VisitsController {
    private readonly visitsService;
    constructor(visitsService: VisitsService);
    create(dto: CreateVisitDto, req: {
        user: any;
    }): Promise<import("../../entities/visit.entity").Visit>;
    findAll(query: QueryVisitDto, req: {
        user: any;
    }): Promise<import("../../entities/visit.entity").Visit[] | [import("../../entities/visit.entity").Visit[], number]>;
    findMy(query: QueryVisitDto, req: {
        user: any;
    }): Promise<[import("../../entities/visit.entity").Visit[], number]>;
    findOne(id: string, req: {
        user: any;
    }): Promise<import("../../entities/visit.entity").Visit>;
}
