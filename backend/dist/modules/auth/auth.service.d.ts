import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userRepository;
    private roleRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        token: string;
        user: {
            id: number;
            phone: string;
            name: string;
            email: string;
            avatar: string;
            regionId: number;
            roles: {
                id: number;
                code: string;
                name: string;
                dataScope: "self" | "team" | "region" | "all";
            }[];
            permissions: string[];
        };
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: number;
            phone: string;
            name: string;
            email: string;
            avatar: string;
            regionId: number;
            roles: {
                id: number;
                code: string;
                name: string;
                dataScope: "self" | "team" | "region" | "all";
            }[];
            permissions: string[];
        };
    }>;
    generateToken(user: User): Promise<{
        token: string;
        user: {
            id: number;
            phone: string;
            name: string;
            email: string;
            avatar: string;
            regionId: number;
            roles: {
                id: number;
                code: string;
                name: string;
                dataScope: "self" | "team" | "region" | "all";
            }[];
            permissions: string[];
        };
    }>;
    extractPermissions(user: User): string[];
    getProfile(userId: number): Promise<{
        id: number;
        phone: string;
        name: string;
        email: string;
        avatar: string;
        regionId: number;
        roles: {
            id: number;
            code: string;
            name: string;
            dataScope: "self" | "team" | "region" | "all";
        }[];
        permissions: string[];
    }>;
}
