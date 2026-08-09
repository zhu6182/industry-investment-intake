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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateCheckLog = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let DuplicateCheckLog = class DuplicateCheckLog {
    id;
    companyName;
    intakeId;
    intakeCompanyName;
    intakeStatus;
    intakeCreatedAt;
    checkerId;
    checkerName;
    checkerPhone;
    sourceIp;
    createdAt;
    checker;
};
exports.DuplicateCheckLog = DuplicateCheckLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DuplicateCheckLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DuplicateCheckLog.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DuplicateCheckLog.prototype, "intakeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DuplicateCheckLog.prototype, "intakeCompanyName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DuplicateCheckLog.prototype, "intakeStatus", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], DuplicateCheckLog.prototype, "intakeCreatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DuplicateCheckLog.prototype, "checkerId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DuplicateCheckLog.prototype, "checkerName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DuplicateCheckLog.prototype, "checkerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DuplicateCheckLog.prototype, "sourceIp", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DuplicateCheckLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'checkerId' }),
    __metadata("design:type", user_entity_1.User)
], DuplicateCheckLog.prototype, "checker", void 0);
exports.DuplicateCheckLog = DuplicateCheckLog = __decorate([
    (0, typeorm_1.Entity)('duplicate_check_logs'),
    (0, typeorm_1.Index)(['companyName']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['checkerPhone']),
    (0, typeorm_1.Index)(['intakeId'])
], DuplicateCheckLog);
//# sourceMappingURL=duplicate-check-log.entity.js.map