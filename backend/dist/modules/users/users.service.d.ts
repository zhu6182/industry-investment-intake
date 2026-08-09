import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
export declare class UsersService {
    private userRepository;
    private roleRepository;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>);
    findAll(query: {
        page?: number;
        limit?: number;
        keyword?: string;
        roleId?: number;
        regionId?: number;
    }): Promise<{
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
    findOne(id: number): Promise<{
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
    create(dto: {
        phone: string;
        password: string;
        name: string;
        email?: string;
        regionId?: number;
        roleIds?: number[];
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
    update(id: number, dto: {
        name?: string;
        email?: string;
        avatar?: string;
        regionId?: number;
        isActive?: boolean;
        roleIds?: number[];
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
    softDelete(id: number): Promise<{
        success: boolean;
    }>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    assignRoles(id: number, roleIds: number[]): Promise<{
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
    resetPassword(id: number, newPassword: string): Promise<{
        success: boolean;
    }>;
    findInvestmentStaff(): Promise<{
        id: number;
        name: string;
        phone: string;
    }[]>;
    findByRoleCodes(codes: string[]): Promise<{
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
    }[]>;
    serialize(user: User): {
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
    };
}
