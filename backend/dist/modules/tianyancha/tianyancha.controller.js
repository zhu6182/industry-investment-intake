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
exports.TianyanchaController = exports.IntakeLookupModule = exports.IntakeLookupService = void 0;
const common_1 = require("@nestjs/common");
const tianyancha_service_1 = require("./tianyancha.service");
const query_company_dto_1 = require("./dto/query-company.dto");
const typeorm_1 = require("@nestjs/typeorm");
const common_2 = require("@nestjs/common");
const typeorm_2 = require("typeorm");
const intake_entity_1 = require("../../entities/intake.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const ALL_ROLES = [
    'admin',
    'middleware_ops',
    'investment_manager',
    'investment_staff',
    'channel_manager',
    'channel_specialist',
];
let IntakeLookupService = class IntakeLookupService {
    intakeRepo;
    constructor(intakeRepo) {
        this.intakeRepo = intakeRepo;
    }
    async checkExisting(companyName) {
        const qb = this.intakeRepo.createQueryBuilder('i');
        qb.where('i.companyName = :companyName', { companyName });
        qb.andWhere('i.status IN (:...activeStatuses)', {
            activeStatuses: ['pending', 'approved', 'assigned', 'following'],
        });
        const count = await qb.getCount();
        return count > 0;
    }
};
exports.IntakeLookupService = IntakeLookupService;
exports.IntakeLookupService = IntakeLookupService = __decorate([
    (0, common_2.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(intake_entity_1.Intake)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IntakeLookupService);
let IntakeLookupModule = class IntakeLookupModule {
};
exports.IntakeLookupModule = IntakeLookupModule;
exports.IntakeLookupModule = IntakeLookupModule = __decorate([
    (0, common_2.Module)({
        providers: [IntakeLookupService],
        exports: [IntakeLookupService],
    })
], IntakeLookupModule);
let TianyanchaController = class TianyanchaController {
    tycService;
    intakeLookup;
    constructor(tycService, intakeLookup) {
        this.tycService = tycService;
        this.intakeLookup = intakeLookup;
    }
    async search(dto) {
        const list = await this.tycService.searchCompany(dto.name);
        return { total: list.length, items: list };
    }
    async validate(dto) {
        return this.tycService.validateAndEnrich(dto.name);
    }
    async lookup(dto) {
        const [validation, exists] = await Promise.all([
            this.tycService.validateAndEnrich(dto.name),
            this.intakeLookup.checkExisting(dto.name).catch(() => false),
        ]);
        return {
            exists,
            canProceed: !exists,
            ...validation,
        };
    }
};
exports.TianyanchaController = TianyanchaController;
__decorate([
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_company_dto_1.QueryCompanyDto]),
    __metadata("design:returntype", Promise)
], TianyanchaController.prototype, "search", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_company_dto_1.QueryCompanyDto]),
    __metadata("design:returntype", Promise)
], TianyanchaController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)('lookup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_company_dto_1.QueryCompanyDto]),
    __metadata("design:returntype", Promise)
], TianyanchaController.prototype, "lookup", null);
exports.TianyanchaController = TianyanchaController = __decorate([
    (0, common_1.Controller)('api/tyc'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...ALL_ROLES),
    __metadata("design:paramtypes", [tianyancha_service_1.TianyanchaService,
        IntakeLookupService])
], TianyanchaController);
//# sourceMappingURL=tianyancha.controller.js.map