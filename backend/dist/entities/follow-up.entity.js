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
exports.FollowUp = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let FollowUp = class FollowUp {
    id;
    intakeId;
    method;
    content;
    followDate;
    photos;
    result;
    nextStep;
    createdAt;
    operator;
};
exports.FollowUp = FollowUp;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FollowUp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FollowUp.prototype, "intakeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ enum: ['phone', 'wechat', 'email', 'onsite', 'other'] }),
    __metadata("design:type", String)
], FollowUp.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], FollowUp.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], FollowUp.prototype, "followDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], FollowUp.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.Column)({
        enum: ['interested', 'negotiating', 'pending_decision', 'not_interested', 'undecided'],
        default: 'undecided',
    }),
    __metadata("design:type", String)
], FollowUp.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FollowUp.prototype, "nextStep", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FollowUp.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'operatorId' }),
    __metadata("design:type", user_entity_1.User)
], FollowUp.prototype, "operator", void 0);
exports.FollowUp = FollowUp = __decorate([
    (0, typeorm_1.Entity)('follow_ups')
], FollowUp);
//# sourceMappingURL=follow-up.entity.js.map