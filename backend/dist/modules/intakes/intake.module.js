"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntakesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const intake_entity_1 = require("../../entities/intake.entity");
const intake_file_entity_1 = require("../../entities/intake-file.entity");
const user_entity_1 = require("../../entities/user.entity");
const review_entity_1 = require("../../entities/review.entity");
const duplicate_check_log_entity_1 = require("../../entities/duplicate-check-log.entity");
const intake_controller_1 = require("./intake.controller");
const intake_service_1 = require("./intake.service");
const tianyancha_module_1 = require("../tianyancha/tianyancha.module");
const reports_module_1 = require("../reports/reports.module");
const referrals_module_1 = require("../referrals/referrals.module");
let IntakesModule = class IntakesModule {
};
exports.IntakesModule = IntakesModule;
exports.IntakesModule = IntakesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([intake_entity_1.Intake, intake_file_entity_1.IntakeFile, user_entity_1.User, review_entity_1.Review, duplicate_check_log_entity_1.DuplicateCheckLog]),
            tianyancha_module_1.TianyanchaModule,
            reports_module_1.ReportsModule,
            referrals_module_1.ReferralsModule,
        ],
        controllers: [intake_controller_1.IntakeController],
        providers: [intake_service_1.IntakeService],
        exports: [intake_service_1.IntakeService],
    })
], IntakesModule);
//# sourceMappingURL=intake.module.js.map