"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntakeLookupService = exports.TianyanchaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tianyancha_service_1 = require("./tianyancha.service");
const tianyancha_controller_1 = require("./tianyancha.controller");
Object.defineProperty(exports, "IntakeLookupService", { enumerable: true, get: function () { return tianyancha_controller_1.IntakeLookupService; } });
const intake_entity_1 = require("../../entities/intake.entity");
const settings_module_1 = require("../settings/settings.module");
let TianyanchaModule = class TianyanchaModule {
};
exports.TianyanchaModule = TianyanchaModule;
exports.TianyanchaModule = TianyanchaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([intake_entity_1.Intake]), settings_module_1.SettingsModule],
        controllers: [tianyancha_controller_1.TianyanchaController],
        providers: [tianyancha_service_1.TianyanchaService, tianyancha_controller_1.IntakeLookupService],
        exports: [tianyancha_service_1.TianyanchaService],
    })
], TianyanchaModule);
//# sourceMappingURL=tianyancha.module.js.map