import { Role } from './role.entity';
export declare class Permission {
    id: number;
    code: string;
    name: string;
    module: string;
    roles: Role[];
}
