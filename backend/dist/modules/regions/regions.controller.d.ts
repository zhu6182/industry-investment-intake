import { RegionsService } from './regions.service';
export declare class RegionsController {
    private readonly regionsService;
    constructor(regionsService: RegionsService);
    findAll(): Promise<import("../../entities/region.entity").Region[]>;
    findTree(): Promise<import("./regions.service").RegionTreeNode[]>;
    findByLevel(level: string): Promise<import("../../entities/region.entity").Region[]>;
    findOne(id: string): Promise<import("../../entities/region.entity").Region>;
    findChildren(id: string): Promise<import("../../entities/region.entity").Region[]>;
    create(dto: any): Promise<import("../../entities/region.entity").Region>;
    update(id: string, dto: any): Promise<import("../../entities/region.entity").Region>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
