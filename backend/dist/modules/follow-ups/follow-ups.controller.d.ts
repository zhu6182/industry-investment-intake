import { FollowUpsService } from './follow-ups.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { QueryFollowUpDto } from './dto/query-follow-up.dto';
export declare class FollowUpsController {
    private readonly followUpsService;
    constructor(followUpsService: FollowUpsService);
    create(dto: CreateFollowUpDto, req: {
        user: any;
    }): Promise<import("../../entities/follow-up.entity").FollowUp>;
    findAll(query: QueryFollowUpDto, req: {
        user: any;
    }): Promise<import("../../entities/follow-up.entity").FollowUp[] | [import("../../entities/follow-up.entity").FollowUp[], number]>;
    findMy(query: QueryFollowUpDto, req: {
        user: any;
    }): Promise<[import("../../entities/follow-up.entity").FollowUp[], number]>;
    findOne(id: string, req: {
        user: any;
    }): Promise<import("../../entities/follow-up.entity").FollowUp>;
}
