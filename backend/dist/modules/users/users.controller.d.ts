import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: string, limit?: string, keyword?: string, roleId?: string, regionId?: string): Promise<{
        list: {
            id: number;
            phone: string;
            name: string;
            email: string;
            avatar: string;
            isActive: boolean;
            regionId: number;
            region: import("../../entities/region.entity").Region;
            roles: {
                id: number;
                code: string;
                name: string;
            }[];
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findInvestmentStaff(): Promise<{
        id: number;
        name: string;
        phone: string;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        phone: string;
        name: string;
        email: string;
        avatar: string;
        isActive: boolean;
        regionId: number;
        region: import("../../entities/region.entity").Region;
        roles: {
            id: number;
            code: string;
            name: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: any): Promise<{
        id: number;
        phone: string;
        name: string;
        email: string;
        avatar: string;
        isActive: boolean;
        regionId: number;
        region: import("../../entities/region.entity").Region;
        roles: {
            id: number;
            code: string;
            name: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: any): Promise<{
        id: number;
        phone: string;
        name: string;
        email: string;
        avatar: string;
        isActive: boolean;
        regionId: number;
        region: import("../../entities/region.entity").Region;
        roles: {
            id: number;
            code: string;
            name: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    resetPassword(id: string, body: {
        password?: string;
    }): Promise<{
        success: boolean;
    }>;
    assignRoles(id: string, body: {
        roleIds: number[];
    }): Promise<{
        id: number;
        phone: string;
        name: string;
        email: string;
        avatar: string;
        isActive: boolean;
        regionId: number;
        region: import("../../entities/region.entity").Region;
        roles: {
            id: number;
            code: string;
            name: string;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
