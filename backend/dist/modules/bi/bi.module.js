"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const intake_entity_1 = require("../../entities/intake.entity");
const region_entity_1 = require("../../entities/region.entity");
const visit_entity_1 = require("../../entities/visit.entity");
const bi_controller_1 = require("./bi.controller");
const bi_service_1 = require("./bi.service");
let BiModule = class BiModule {
};
exports.BiModule = BiModule;
exports.BiModule = BiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([intake_entity_1.Intake, region_entity_1.Region, visit_entity_1.Visit]),
        ],
        controllers: [bi_controller_1.BiController],
        providers: [bi_service_1.BiService],
    })
], BiModule);
//# sourceMappingURL=bi.module.js.map