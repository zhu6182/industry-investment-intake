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
exports.RegionsController = void 0;
const common_1 = require("@nestjs/common");
const regions_service_1 = require("./regions.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let RegionsController = class RegionsController {
    regionsService;
    constructor(regionsService) {
        this.regionsService = regionsService;
    }
    findAll() {
        return this.regionsService.findAll();
    }
    findTree() {
        return this.regionsService.findTree();
    }
    findByLevel(level) {
        return this.regionsService.findByLevel(Number(level));
    }
    findOne(id) {
        return this.regionsService.findOne(Number(id));
    }
    findChildren(id) {
        return this.regionsService.findChildren(Number(id));
    }
    create(dto) {
        return this.regionsService.create(dto);
    }
    update(id, dto) {
        return this.regionsService.update(Number(id), dto);
    }
    remove(id) {
        return this.regionsService.remove(Number(id));
    }
};
exports.RegionsController = RegionsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RegionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RegionsController.prototype, "findTree", null);
__decorate([
    (0, common_1.Get)('level'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Query)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegionsController.prototype, "findByLevel", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/children'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegionsController.prototype, "findChildren", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RegionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RegionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegionsController.prototype, "remove", null);
exports.RegionsController = RegionsController = __decorate([
    (0, common_1.Controller)('api/regions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [regions_service_1.RegionsService])
], RegionsController);
//# sourceMappingURL=regions.controller.js.map