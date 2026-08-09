import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: {
        user: {
            id: number;
        };
    }): Promise<{
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
