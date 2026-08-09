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
exports.IntakeFile = void 0;
const typeorm_1 = require("typeorm");
const intake_entity_1 = require("./intake.entity");
let IntakeFile = class IntakeFile {
    id;
    type;
    originalName;
    storedName;
    url;
    size;
    uploadedAt;
    intake;
};
exports.IntakeFile = IntakeFile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], IntakeFile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ enum: ['application', 'ppt', 'data_sheet', 'photo'] }),
    __metadata("design:type", String)
], IntakeFile.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IntakeFile.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IntakeFile.prototype, "storedName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], IntakeFile.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], IntakeFile.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IntakeFile.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => intake_entity_1.Intake, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'intakeId' }),
    __metadata("design:type", intake_entity_1.Intake)
], IntakeFile.prototype, "intake", void 0);
exports.IntakeFile = IntakeFile = __decorate([
    (0, typeorm_1.Entity)('intake_files')
], IntakeFile);
//# sourceMappingURL=intake-file.entity.js.map