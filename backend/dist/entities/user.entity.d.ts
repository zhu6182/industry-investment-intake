import { Role } from './role.entity';
import { Region } from './region.entity';
export declare class User {
    id: number;
    phone: string;
    password: string;
    name: string;
    email: string;
    avatar: string;
    isActive: boolean;
    regionId: number;
    createdAt: Date;
    updatedAt: Date;
    roles: Role[];
    region: Region;
}
