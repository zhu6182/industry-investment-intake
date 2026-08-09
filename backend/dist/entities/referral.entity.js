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
exports.Referral = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const intake_entity_1 = require("./intake.entity");
let Referral = class Referral {
    id;
    referrerId;
    intakeId;
    type;
    createdAt;
    referrer;
    intake;
};
exports.Referral = Referral;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Referral.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Referral.prototype, "referrerId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Referral.prototype, "intakeId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        enum: ['referrer', 'inviter', 'partner'],
        default: 'referrer',
    }),
    __metadata("design:type", String)
], Referral.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Referral.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'referrerId' }),
    __metadata("design:type", user_entity_1.User)
], Referral.prototype, "referrer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intake_entity_1.Intake, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'intakeId' }),
    __metadata("design:type", intake_entity_1.Intake)
], Referral.prototype, "intake", void 0);
exports.Referral = Referral = __decorate([
    (0, typeorm_1.Entity)('referrals')
], Referral);
//# sourceMappingURL=referral.entity.js.map