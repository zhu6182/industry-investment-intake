"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReportGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const report_entity_1 = require("../../entities/report.entity");
const document_parser_service_1 = require("../document-parser/document-parser.service");
const PDFDocConstructor = require('pdfkit');
let ReportGeneratorService = ReportGeneratorService_1 = class ReportGeneratorService {
    reportRepo;
    parserService;
    logger = new common_1.Logger(ReportGeneratorService_1.name);
    reportDir;
    baseUrl;
    fontDir;
    constructor(reportRepo, parserService) {
        this.reportRepo = reportRepo;
        this.parserService = parserService;
        this.reportDir = path.join(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'), 'reports');
        this.baseUrl = '/uploads/reports';
        this.fontDir = path.join(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'), 'fonts');
        this.ensureDir(this.reportDir);
        this.ensureDir(this.fontDir);
    }
    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    findChineseFont() {
        const candidates = [
            path.join(this.fontDir, 'NotoSansSC-Regular.ttf'),
            path.join(this.fontDir, 'NotoSerifSC-Regular.ttf'),
            path.join(this.fontDir, 'SourceHanSansCN-Regular.ttf'),
            path.join(this.fontDir, 'SourceHanSerifCN-Regular.ttf'),
            path.join(this.fontDir, 'SimSun.ttf'),
            path.join(this.fontDir, 'SimHei.ttf'),
            path.join(this.fontDir, 'MicrosoftYaHei.ttf'),
            'C:/Windows/Fonts/msyh.ttc',
            'C:/Windows/Fonts/msyh.ttf',
            'C:/Windows/Fonts/simsun.ttc',
            'C:/Windows/Fonts/simhei.ttf',
            '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
            '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
        ];
        for (const p of candidates) {
            if (fs.existsSync(p))
                return p;
        }
        return null;
    }
    async generate(intake, assignTo) {
        const existing = await this.reportRepo.findOne({
            where: { intakeId: intake.id },
        });
        if (existing) {
            this.logger.log(`Report already exists for intake #${intake.id}, returning existing`);
            return existing;
        }
        this.logger.log(`Generating report for intake #${intake.id} (${intake.companyName})`);
        const parsedData = await this.parseUploadedFiles(intake);
        const summary = this.buildSummary(intake, assignTo, parsedData);
        const fileName = `report-${intake.id}-${Date.now()}.pdf`;
        const pdfPath = path.join(this.reportDir, fileName);
        await this.renderPdf(intake, assignTo, parsedData, pdfPath);
        const report = this.reportRepo.create({
            intakeId: intake.id,
            pdfPath,
            pdfUrl: `${this.baseUrl}/${fileName}`,
            generatedBy: 0,
            summary,
        });
        return this.reportRepo.save(report);
    }
    async parseUploadedFiles(intake) {
        const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
        const pptFiles = (intake.files || []).filter((f) => f.type === 'ppt');
        const applicationFiles = (intake.files || []).filter((f) => f.type === 'application');
        const dataSheetFiles = (intake.files || []).filter((f) => f.type === 'data_sheet');
        let pptResult = { title: '', slides: [] };
        let excelResult = { sheets: {}, summary: {} };
        let appResult = {};
        if (pptFiles.length > 0) {
            const storedName = pptFiles[0].storedName;
            const filePath = path.join(uploadsDir, storedName);
            pptResult = await this.parserService.parsePptx(filePath);
        }
        if (dataSheetFiles.length > 0) {
            const storedName = dataSheetFiles[0].storedName;
            const filePath = path.join(uploadsDir, storedName);
            excelResult = await this.parserService.parseExcel(filePath);
        }
        if (applicationFiles.length > 0) {
            const storedName = applicationFiles[0].storedName;
            const filePath = path.join(uploadsDir, storedName);
            appResult = await this.parserService.parseApplicationForm(filePath);
        }
        return { pptResult, excelResult, appResult };
    }
    buildSummary(intake, assignTo, parsedData) {
        const tyc = intake.tycValidation || {};
        const company = tyc.company || {};
        let shareholders = [];
        if (intake.shareholders) {
            try {
                shareholders = JSON.parse(intake.shareholders);
            }
            catch { }
        }
        else if (Array.isArray(company.shareholders)) {
            shareholders = company.shareholders;
        }
        return {
            companyName: intake.companyName,
            creditCode: intake.creditCode || company.creditCode,
            legalPerson: intake.legalPerson || company.legalPerson,
            establishDate: intake.establishDate || company.establishDate,
            industry: intake.industry || company.industry,
            registeredCapital: company.registeredCapital,
            shareholders,
            tycValid: !!tyc.isValid,
            tycReasons: tyc.reasons || [],
            pptTitle: parsedData.pptResult.title,
            pptSlidesCount: parsedData.pptResult.slides.length,
            excelSummary: parsedData.excelResult.summary,
            assignedTo: assignTo?.name || null,
        };
    }
    async renderPdf(intake, assignTo, parsedData, outputPath) {
        return new Promise((resolve, reject) => {
            try {
                const fontPath = this.findChineseFont();
                const doc = new PDFDocConstructor({
                    size: 'A4',
                    margin: 50,
                    info: {
                        Title: `${intake.companyName} - 企业分析报告`,
                        Author: '产业投资进件系统',
                    },
                });
                const stream = fs.createWriteStream(outputPath);
                doc.pipe(stream);
                let canWriteChinese = false;
                if (fontPath) {
                    try {
                        doc.registerFont('CN', fontPath);
                        doc.font('CN');
                        canWriteChinese = true;
                    }
                    catch (err) {
                        this.logger.warn(`Failed to register Chinese font: ${err.message}`);
                    }
                }
                const font = canWriteChinese ? 'CN' : 'Helvetica';
                const titleFont = canWriteChinese ? 'CN' : 'Helvetica-Bold';
                doc.font(titleFont).fontSize(32);
                doc.text('企业分析报告', 0, 180, { align: 'center' });
                doc.moveDown(1.5);
                doc.fontSize(20).text(intake.companyName, { align: 'center' });
                doc.moveDown(3);
                doc.font(font).fontSize(12);
                const now = new Date();
                const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                doc.text(`生成日期：${dateStr}`, { align: 'center' });
                if (assignTo) {
                    doc.text(`招商人员：${assignTo.name}`, { align: 'center' });
                }
                doc.text(`进件编号：#${intake.id}`, { align: 'center' });
                doc.addPage();
                this.writeChapterHeader(doc, titleFont, font, '第1章  企业基本信息');
                const tyc = intake.tycValidation || {};
                const company = tyc.company || {};
                const basicInfo = [
                    ['企业名称', intake.companyName],
                    ['统一社会信用代码', intake.creditCode || company.creditCode || '-'],
                    ['法定代表人', intake.legalPerson || company.legalPerson || '-'],
                    ['成立日期', intake.establishDate || company.establishDate || '-'],
                    ['行业分类', intake.industry || company.industry || '-'],
                    ['注册资本', company.registeredCapital || '-'],
                ];
                this.writeInfoTable(doc, font, basicInfo);
                doc.moveDown(0.8);
                doc.font(titleFont).fontSize(14).text('核名校验结果');
                doc.moveDown(0.4);
                doc.font(font).fontSize(12);
                if (tyc.isValid) {
                    doc.fillColor('#16a34a').text('✅ 核名通过');
                }
                else {
                    doc.fillColor('#dc2626').text('❌ 核名未通过');
                }
                doc.fillColor('#000');
                if (tyc.reasons && tyc.reasons.length > 0) {
                    doc.moveDown(0.3);
                    doc.text(`校验详情：${tyc.reasons.join('；')}`);
                }
                doc.addPage();
                this.writeChapterHeader(doc, titleFont, font, '第2章  股东结构');
                let shareholders = [];
                if (intake.shareholders) {
                    try {
                        shareholders = JSON.parse(intake.shareholders);
                    }
                    catch { }
                }
                else if (Array.isArray(company.shareholders)) {
                    shareholders = company.shareholders;
                }
                if (shareholders.length === 0) {
                    doc.font(font).fontSize(12).text('暂无股东数据');
                }
                else {
                    this.writeShareholderTable(doc, font, shareholders);
                }
                doc.addPage();
                this.writeChapterHeader(doc, titleFont, font, '第3章  进件资料摘要');
                doc.font(titleFont).fontSize(14).text('申请表关键字段');
                doc.moveDown(0.3);
                doc.font(font).fontSize(12);
                const appRows = [
                    ['入驻面积', intake.area ? `${intake.area} ㎡` : '-'],
                    ['申请人', intake.applicant?.name || '-'],
                    ['申请日期', intake.createdAt ? this.formatDate(intake.createdAt) : '-'],
                ];
                this.writeInfoTable(doc, font, appRows);
                doc.moveDown(0.6);
                doc.font(titleFont).fontSize(14).text('公司介绍 PPT');
                doc.moveDown(0.3);
                doc.font(font).fontSize(12);
                if (parsedData.pptResult.slides.length === 0) {
                    doc.text('未上传 PPT 或 PPT 解析失败');
                }
                else {
                    doc.text(`PPT 标题：${parsedData.pptResult.title || '-'}`);
                    doc.moveDown(0.2);
                    const first3 = parsedData.pptResult.slides.slice(0, 3);
                    first3.forEach((slideText, idx) => {
                        doc.text(`第 ${idx + 1} 页：${slideText.slice(0, 150)}${slideText.length > 150 ? '...' : ''}`);
                    });
                }
                doc.moveDown(0.6);
                doc.font(titleFont).fontSize(14).text('资料表关键数据');
                doc.moveDown(0.3);
                doc.font(font).fontSize(12);
                const excelSummary = parsedData.excelResult.summary || {};
                if (excelSummary.rowCount !== undefined) {
                    doc.text(`数据行数：${excelSummary.rowCount}`);
                    doc.text(`字段数：${excelSummary.colCount}`);
                    if (Array.isArray(excelSummary.headers)) {
                        doc.text(`字段列表：${excelSummary.headers.join('、')}`);
                    }
                }
                else {
                    doc.text('未上传资料表或资料表解析失败');
                }
                doc.addPage();
                this.writeChapterHeader(doc, titleFont, font, '第4章  核名校验结果');
                doc.font(font).fontSize(12);
                doc.moveDown(0.2);
                doc.text('企业状态：');
                doc.moveDown(0.3);
                if (tyc.isValid) {
                    doc.fillColor('#16a34a').text('✅  核名通过 — 企业在天眼查库中合法存续');
                }
                else {
                    doc.fillColor('#dc2626').text('❌  核名未通过');
                }
                doc.fillColor('#000');
                doc.moveDown(0.4);
                doc.text('校验详情：');
                doc.moveDown(0.3);
                if (tyc.reasons && tyc.reasons.length > 0) {
                    tyc.reasons.forEach((r) => {
                        doc.text(`• ${r}`);
                    });
                }
                else if (tyc.isValid) {
                    doc.text('• 企业名称、信用代码、法人信息核对无误');
                    doc.text('• 经营状态正常存续');
                }
                else {
                    doc.text('• 未获取到详细校验信息');
                }
                doc.moveDown(1);
                doc.font(font).fontSize(10).fillColor('#888');
                doc.text('— 本报告由产业投资进件系统自动生成 —', { align: 'center' });
                doc.fillColor('#000');
                doc.end();
                stream.on('finish', () => {
                    this.logger.log(`PDF generated: ${outputPath}`);
                    resolve();
                });
                stream.on('error', (err) => {
                    reject(err);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    writeChapterHeader(doc, titleFont, font, title) {
        doc.save();
        doc.font(titleFont).fontSize(18).fillColor('#1e3a8a').text(title, 50, doc.y);
        doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).strokeColor('#1e3a8a').stroke();
        doc.restore();
        doc.moveDown(0.8);
    }
    writeInfoTable(doc, font, rows) {
        const startX = 50;
        let y = doc.y + 4;
        doc.font(font).fontSize(11);
        rows.forEach(([k, v]) => {
            doc.rect(startX, y, 140, 22).strokeColor('#e5e7eb').stroke();
            doc.rect(startX + 140, y, 405, 22).strokeColor('#e5e7eb').stroke();
            doc.fillColor('#6b7280').text(k, startX + 6, y + 6);
            doc.fillColor('#000').text(String(v || '-'), startX + 146, y + 6);
            y += 22;
        });
        doc.y = y + 6;
    }
    writeShareholderTable(doc, font, shareholders) {
        const startX = 50;
        let y = doc.y + 4;
        doc.font(font).fontSize(11);
        const headers = ['股东', '持股比例', '认缴金额'];
        const widths = [200, 140, 205];
        let x = startX;
        headers.forEach((h, i) => {
            doc.rect(x, y, widths[i], 22).strokeColor('#1e3a8a').stroke();
            doc.fillColor('#1e3a8a').text(h, x + 6, y + 6);
            x += widths[i];
        });
        y += 22;
        shareholders.forEach((s) => {
            x = startX;
            const values = [
                String(s.name || '-'),
                String(s.ratio ?? '-'),
                String(s.subscribeAmount || '-'),
            ];
            values.forEach((v, i) => {
                doc.rect(x, y, widths[i], 22).strokeColor('#e5e7eb').stroke();
                doc.fillColor('#000').text(v, x + 6, y + 6);
                x += widths[i];
            });
            y += 22;
            if (y > 750) {
                doc.addPage();
                y = doc.y + 4;
            }
        });
        doc.y = y + 6;
    }
    formatDate(d) {
        const date = d instanceof Date ? d : new Date(d);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    async findByIntakeId(intakeId) {
        return this.reportRepo.findOne({ where: { intakeId } });
    }
    async listByIntakeIds(intakeIds) {
        if (intakeIds.length === 0)
            return [];
        return this.reportRepo.find({ where: { intakeId: (0, typeorm_2.In)(intakeIds) } });
    }
    async requireByIntakeId(intakeId) {
        const report = await this.findByIntakeId(intakeId);
        if (!report) {
            throw new common_1.NotFoundException(`进件 #${intakeId} 的报告尚未生成`);
        }
        return report;
    }
};
exports.ReportGeneratorService = ReportGeneratorService;
exports.ReportGeneratorService = ReportGeneratorService = ReportGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        document_parser_service_1.DocumentParserService])
], ReportGeneratorService);
//# sourceMappingURL=report-generator.service.js.map