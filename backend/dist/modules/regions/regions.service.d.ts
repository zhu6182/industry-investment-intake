import { Repository } from 'typeorm';
import { Region } from '../../entities/region.entity';
export interface RegionTreeNode extends Region {
    children: RegionTreeNode[];
}
export declare class RegionsService {
    private regionRepo;
    constructor(regionRepo: Repository<Region>);
    findAll(): Promise<Region[]>;
    findTree(): Promise<RegionTreeNode[]>;
    findChildren(parentId: number): Promise<Region[]>;
    findOne(id: number): Promise<Region>;
    create(dto: {
        name: string;
        level: number;
        parentId?: number | null;
    }): Promise<Region>;
    update(id: number, dto: {
        name?: string;
        level?: number;
        parentId?: number | null;
    }): Promise<Region>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    findByLevel(level: number): Promise<Region[]>;
}
