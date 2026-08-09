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
exports.DuplicateCheckLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const duplicate_check_log_entity_1 = require("../../entities/duplicate-check-log.entity");
let DuplicateCheckLogsService = class DuplicateCheckLogsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async query(params) {
        const page = Math.max(1, Number(params.page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
        const where = {};
        if (params.companyName) {
            where.companyName = (0, typeorm_2.Like)(`%${params.companyName}%`);
        }
        if (params.checkerPhone) {
            where.checkerPhone = params.checkerPhone;
        }
        if (params.intakeStatus) {
            where.intakeStatus = params.intakeStatus;
        }
        if (params.startDate && params.endDate) {
            where.createdAt = (0, typeorm_2.Between)(new Date(params.startDate), new Date(params.endDate));
        }
        else if (params.startDate) {
            where.createdAt = (0, typeorm_2.Between)(new Date(params.startDate), new Date());
        }
        else if (params.endDate) {
            where.createdAt = (0, typeorm_2.Between)(new Date('2000-01-01'), new Date(params.endDate));
        }
        const [items, total] = await this.repo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return { items, total, page, pageSize };
    }
    async findOne(id) {
        const log = await this.repo.findOne({ where: { id } });
        if (!log)
            throw new common_1.NotFoundException(`DuplicateCheckLog #${id} not found`);
        return log;
    }
    async summary() {
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const last30DaysCount = await this.repo
            .createQueryBuilder('l')
            .where('l.createdAt >= :since', { since })
            .getCount();
        const topDuplicatedRaw = await this.repo
            .createQueryBuilder('l')
            .select('l.companyName', 'companyName')
            .addSelect('COUNT(*)', 'count')
            .groupBy('l.companyName')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();
        const topCheckersRaw = await this.repo
            .createQueryBuilder('l')
            .select('l.checkerName', 'checkerName')
            .addSelect('l.checkerPhone', 'checkerPhone')
            .addSelect('COUNT(*)', 'count')
            .groupBy('l.checkerName')
            .addGroupBy('l.checkerPhone')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();
        return {
            last30DaysCount,
            topDuplicatedCompanies: topDuplicatedRaw.map((r) => ({
                companyName: r.companyName,
                count: Number(r.count),
            })),
            topCheckers: topCheckersRaw.map((r) => ({
                checkerName: r.checkerName,
                checkerPhone: r.checkerPhone,
                count: Number(r.count),
            })),
        };
    }
};
exports.DuplicateCheckLogsService = DuplicateCheckLogsService;
exports.DuplicateCheckLogsService = DuplicateCheckLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(duplicate_check_log_entity_1.DuplicateCheckLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DuplicateCheckLogsService);
//# sourceMappingURL=duplicate-check-logs.service.js.map