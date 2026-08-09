import { User } from './user.entity';
import { Permission } from './permission.entity';
export declare class Role {
    id: number;
    code: string;
    name: string;
    description: string;
    dataScope: 'self' | 'team' | 'region' | 'all';
    users: User[];
    permissions: Permission[];
}
