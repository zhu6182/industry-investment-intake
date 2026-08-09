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
exports.RankingsController = void 0;
const common_1 = require("@nestjs/common");
const rankings_service_1 = require("./rankings.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let RankingsController = class RankingsController {
    rankingsService;
    constructor(rankingsService) {
        this.rankingsService = rankingsService;
    }
    rankByCount(limit) {
        return this.rankingsService.rankByCount(limit ? Number(limit) : 50);
    }
    rankByArea(limit) {
        return this.rankingsService.rankByArea(limit ? Number(limit) : 50);
    }
    getMyRank(req = { user: null }) {
        const uid = req.user?.id;
        return this.rankingsService.getMyRank(Number(uid));
    }
};
exports.RankingsController = RankingsController;
__decorate([
    (0, common_1.Get)('by-count'),
    (0, roles_decorator_1.Roles)('admin', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager', 'middleware_ops'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RankingsController.prototype, "rankByCount", null);
__decorate([
    (0, common_1.Get)('by-area'),
    (0, roles_decorator_1.Roles)('admin', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager', 'middleware_ops'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RankingsController.prototype, "rankByArea", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)('admin', 'channel_specialist', 'channel_manager', 'investment_staff', 'investment_manager', 'middleware_ops'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RankingsController.prototype, "getMyRank", null);
exports.RankingsController = RankingsController = __decorate([
    (0, common_1.Controller)('api/rankings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [rankings_service_1.RankingsService])
], RankingsController);
//# sourceMappingURL=rankings.controller.js.map