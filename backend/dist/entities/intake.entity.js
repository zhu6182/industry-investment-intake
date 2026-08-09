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
exports.Intake = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const intake_file_entity_1 = require("./intake-file.entity");
let Intake = class Intake {
    id;
    companyName;
    creditCode;
    legalPerson;
    establishDate;
    industry;
    shareholders;
    applicationRegionId;
    area;
    status;
    rejectReason;
    tycValidation;
    createdAt;
    updatedAt;
    applicant;
    assignedTo;
    files;
};
exports.Intake = Intake;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Intake.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Intake.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Intake.prototype, "creditCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Intake.prototype, "legalPerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Intake.prototype, "establishDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Intake.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Intake.prototype, "shareholders", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Intake.prototype, "applicationRegionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'float',
        nullable: true,
    }),
    __metadata("design:type", Number)
], Intake.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({
        enum: ['pending', 'rejected', 'approved', 'assigned', 'following', 'landed', 'lost'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], Intake.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Intake.prototype, "rejectReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Intake.prototype, "tycValidation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Intake.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], Intake.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'applicantId' }),
    __metadata("design:type", user_entity_1.User)
], Intake.prototype, "applicant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assignedToId' }),
    __metadata("design:type", user_entity_1.User)
], Intake.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => intake_file_entity_1.IntakeFile, (f) => f.intake),
    __metadata("design:type", Array)
], Intake.prototype, "files", void 0);
exports.Intake = Intake = __decorate([
    (0, typeorm_1.Entity)('intakes')
], Intake);
//# sourceMappingURL=intake.entity.js.map