import { User } from './user.entity';
import { Region } from './region.entity';
export declare class Visit {
    id: number;
    intakeId: number;
    visitDate: Date;
    visitLocation: string;
    visitContent: string;
    photos: string[];
    applicationRegionId: number;
    area: number;
    createdAt: Date;
    operator: User;
    region: Region;
}
