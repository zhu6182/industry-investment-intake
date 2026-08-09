"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../../entities/role.entity");
const permission_entity_1 = require("../../entities/permission.entity");
let RolesService = class RolesService {
    roleRepository;
    permissionRepository;
    constructor(roleRepository, permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }
    async findAll() {
        const roles = await this.roleRepository.find({
            relations: { permissions: true },
            order: { id: 'ASC' },
        });
        return roles.map((r) => this.serialize(r));
    }
    async findOne(id) {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: { permissions: true },
        });
        if (!role) {
            throw new common_1.NotFoundException('角色不存在');
        }
        return this.serialize(role);
    }
    async create(dto) {
        const existing = await this.roleRepository.findOne({ where: { code: dto.code } });
        if (existing) {
            throw new common_1.ConflictException('角色编码已存在');
        }
        const role = this.roleRepository.create({
            code: dto.code,
            name: dto.name,
            description: dto.description,
            dataScope: dto.dataScope || 'self',
        });
        if (dto.permissionIds?.length) {
            role.permissions = await this.permissionRepository.findBy({ id: (0, typeorm_2.In)(dto.permissionIds) });
        }
        const saved = await this.roleRepository.save(role);
        return this.serialize(saved);
    }
    async update(id, dto) {
        const role = await this.roleRepository.findOne({ where: { id } });
        if (!role) {
            throw new common_1.NotFoundException('角色不存在');
        }
        Object.assign(role, dto);
        const saved = await this.roleRepository.save(role);
        return this.serialize(saved);
    }
    async remove(id) {
        const role = await this.roleRepository.findOne({ where: { id }, relations: { users: true } });
        if (!role) {
            throw new common_1.NotFoundException('角色不存在');
        }
        if (role.users?.length) {
            throw new common_1.ConflictException('该角色下还有用户，无法删除');
        }
        await this.roleRepository.remove(role);
        return { success: true };
    }
    async assignPermissions(id, permissionIds) {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: { permissions: true },
        });
        if (!role) {
            throw new common_1.NotFoundException('角色不存在');
        }
        role.permissions = await this.permissionRepository.findBy({ id: (0, typeorm_2.In)(permissionIds) });
        const saved = await this.roleRepository.save(role);
        return this.serialize(saved);
    }
    async getAllPermissions() {
        return this.permissionRepository.find({
            order: { module: 'ASC', code: 'ASC' },
        });
    }
    serialize(role) {
        return {
            id: role.id,
            code: role.code,
            name: role.name,
            description: role.description,
            dataScope: role.dataScope,
            permissions: role.permissions?.map((p) => ({
                id: p.id,
                code: p.code,
                name: p.name,
                module: p.module,
            })) || [],
        };
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RolesService);
//# sourceMappingURL=roles.service.js.map