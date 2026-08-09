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
exports.RegionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const region_entity_1 = require("../../entities/region.entity");
let RegionsService = class RegionsService {
    regionRepo;
    constructor(regionRepo) {
        this.regionRepo = regionRepo;
    }
    async findAll() {
        return this.regionRepo.find({
            order: { level: 'ASC', id: 'ASC' },
        });
    }
    async findTree() {
        const all = await this.regionRepo.find({
            order: { level: 'ASC', id: 'ASC' },
        });
        const map = new Map();
        for (const r of all) {
            map.set(r.id, { ...r, children: [] });
        }
        const roots = [];
        for (const node of map.values()) {
            if (node.parentId && map.has(node.parentId)) {
                map.get(node.parentId).children.push(node);
            }
            else {
                roots.push(node);
            }
        }
        return roots;
    }
    async findChildren(parentId) {
        return this.regionRepo.find({
            where: { parentId: parentId },
            order: { id: 'ASC' },
        });
    }
    async findOne(id) {
        const region = await this.regionRepo.findOne({ where: { id } });
        if (!region)
            throw new common_1.NotFoundException('区域不存在');
        return region;
    }
    async create(dto) {
        const region = new region_entity_1.Region();
        region.name = dto.name;
        region.level = dto.level;
        region.parentId = dto.parentId ?? null;
        return this.regionRepo.save(region);
    }
    async update(id, dto) {
        const region = await this.findOne(id);
        Object.assign(region, dto);
        return this.regionRepo.save(region);
    }
    async remove(id) {
        const region = await this.findOne(id);
        const children = await this.regionRepo.count({ where: { parentId: id } });
        if (children > 0) {
            throw new Error('存在子区域，无法删除');
        }
        await this.regionRepo.remove(region);
        return { success: true };
    }
    async findByLevel(level) {
        return this.regionRepo.find({
            where: { level },
            order: { id: 'ASC' },
        });
    }
};
exports.RegionsService = RegionsService;
exports.RegionsService = RegionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RegionsService);
//# sourceMappingURL=regions.service.js.map