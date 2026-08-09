import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
export declare class RolesService {
    private roleRepository;
    private permissionRepository;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>);
    findAll(): Promise<{
        id: number;
        code: string;
        name: string;
        description: string;
        dataScope: "self" | "team" | "region" | "all";
        permissions: {
            id: number;
            code: string;
            name: string;
            module: string;
        }[];
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        code: string;
        name: string;
        description: string;
        dataScope: "self" | "team" | "region" | "all";
        permissions: {
            id: number;
            code: string;
            name: string;
            module: string;
        }[];
    }>;
    create(dto: {
        code: string;
        name: string;
        description?: string;
        dataScope?: 'self' | 'team' | 'region' | 'all';
        permissionIds?: number[];
    }): Promise<{
        id: number;
        code: string;
        name: string;
        description: string;
        dataScope: "self" | "team" | "region" | "all";
        permissions: {
            id: number;
            code: string;
            name: string;
            module: string;
        }[];
    }>;
    update(id: number, dto: {
        name?: string;
        description?: string;
        dataScope?: 'self' | 'team' | 'region' | 'all';
    }): Promise<{
        id: number;
        code: string;
        name: string;
        description: string;
        dataScope: "self" | "team" | "region" | "all";
        permissions: {
            id: number;
            code: string;
            name: string;
            module: string;
        }[];
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    assignPermissions(id: number, permissionIds: number[]): Promise<{
        id: number;
        code: string;
        name: string;
        description: string;
        dataScope: "self" | "team" | "region" | "all";
        permissions: {
            id: number;
            code: string;
            name: string;
            module: string;
        }[];
    }>;
    getAllPermissions(): Promise<Permission[]>;
    serialize(role: Role): {
        id: number;
        code: string;
        name: string;
        description: string;
        dataScope: "self" | "team" | "region" | "all";
        permissions: {
            id: number;
            code: string;
            name: string;
            module: string;
        }[];
    };
}
