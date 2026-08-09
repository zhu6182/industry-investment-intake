"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../../entities/user.entity");
const role_entity_1 = require("../../entities/role.entity");
let AuthService = class AuthService {
    userRepository;
    roleRepository;
    jwtService;
    constructor(userRepository, roleRepository, jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.userRepository.findOne({
            where: { phone: dto.phone },
        });
        if (existing) {
            throw new common_1.ConflictException('手机号已注册');
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = this.userRepository.create({
            phone: dto.phone,
            password: hashed,
            name: dto.name,
            email: dto.email,
        });
        const memberRole = await this.roleRepository.findOne({
            where: { code: 'channel_specialist' },
        });
        if (memberRole) {
            user.roles = [memberRole];
        }
        const saved = await this.userRepository.save(user);
        return this.generateToken(saved);
    }
    async login(dto) {
        const user = await this.userRepository.findOne({
            where: { phone: dto.phone },
            relations: { roles: { permissions: true } },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('账号已被禁用');
        }
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid) {
            throw new common_1.UnauthorizedException('手机号或密码错误');
        }
        return this.generateToken(user);
    }
    async generateToken(user) {
        const payload = { sub: user.id, phone: user.phone };
        const token = this.jwtService.sign(payload);
        return {
            token,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                regionId: user.regionId,
                roles: user.roles?.map((r) => ({ id: r.id, code: r.code, name: r.name, dataScope: r.dataScope })) || [],
                permissions: this.extractPermissions(user),
            },
        };
    }
    extractPermissions(user) {
        const perms = new Set();
        user.roles?.forEach((role) => {
            role.permissions?.forEach((p) => perms.add(p.code));
        });
        return Array.from(perms);
    }
    async getProfile(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: { roles: { permissions: true }, region: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        return {
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            regionId: user.regionId,
            roles: user.roles?.map((r) => ({ id: r.id, code: r.code, name: r.name, dataScope: r.dataScope })) || [],
            permissions: this.extractPermissions(user),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map