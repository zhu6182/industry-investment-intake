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
exports.DuplicateCheckLogsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const duplicate_check_logs_service_1 = require("./duplicate-check-logs.service");
const query_log_dto_1 = require("./dto/query-log.dto");
let DuplicateCheckLogsController = class DuplicateCheckLogsController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    query(params) {
        return this.svc.query(params);
    }
    findOne(id) {
        return this.svc.findOne(Number(id));
    }
    summary() {
        return this.svc.summary();
    }
};
exports.DuplicateCheckLogsController = DuplicateCheckLogsController;
__decorate([
    (0, common_1.Post)('query'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_log_dto_1.QueryLogDto]),
    __metadata("design:returntype", void 0)
], DuplicateCheckLogsController.prototype, "query", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DuplicateCheckLogsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    (0, roles_decorator_1.Roles)('admin', 'middleware_ops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DuplicateCheckLogsController.prototype, "summary", null);
exports.DuplicateCheckLogsController = DuplicateCheckLogsController = __decorate([
    (0, common_1.Controller)('api/duplicate-check-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [duplicate_check_logs_service_1.DuplicateCheckLogsService])
], DuplicateCheckLogsController);
//# sourceMappingURL=duplicate-check-logs.controller.js.map