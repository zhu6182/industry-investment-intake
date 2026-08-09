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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_entity_1 = require("../../entities/setting.entity");
const DEFAULT_REPORT_TEMPLATE = JSON.stringify({
    companyInfo: { visible: true, order: 1 },
    tycValidation: { visible: true, order: 2 },
    shareholding: { visible: true, order: 3 },
    financials: { visible: false, order: 4 },
    industryAnalysis: { visible: true, order: 5 },
    investmentRecommendation: { visible: true, order: 6 },
});
let SettingsService = class SettingsService {
    settingRepo;
    constructor(settingRepo) {
        this.settingRepo = settingRepo;
    }
    async getByKey(key) {
        const setting = await this.settingRepo.findOne({ where: { key } });
        return setting?.value ?? null;
    }
    async set(key, value, description) {
        let setting = await this.settingRepo.findOne({ where: { key } });
        if (!setting) {
            setting = this.settingRepo.create({ key, value, description });
        }
        else {
            setting.value = value;
            if (description !== undefined)
                setting.description = description;
        }
        return this.settingRepo.save(setting);
    }
    async listAll() {
        return this.settingRepo.find({ order: { key: 'ASC' } });
    }
    async getReportTemplate() {
        let raw = await this.getByKey('report_template');
        if (!raw) {
            raw = DEFAULT_REPORT_TEMPLATE;
            await this.set('report_template', raw, '报告模板字段配置');
        }
        try {
            return JSON.parse(raw);
        }
        catch {
            return JSON.parse(DEFAULT_REPORT_TEMPLATE);
        }
    }
    async updateReportTemplate(template) {
        await this.set('report_template', JSON.stringify(template), '报告模板字段配置');
        return template;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map