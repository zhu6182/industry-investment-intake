import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
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
    getPermissions(): Promise<import("../../entities/permission.entity").Permission[]>;
    findOne(id: string): Promise<{
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
    create(dto: any): Promise<{
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
    update(id: string, dto: any): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
    updatePermissions(id: string, body: {
        permissionIds: number[];
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
}
