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
var DocumentParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentParserService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const XLSX = __importStar(require("xlsx"));
let DocumentParserService = DocumentParserService_1 = class DocumentParserService {
    logger = new common_1.Logger(DocumentParserService_1.name);
    async parsePptx(filePath) {
        const result = {
            title: '',
            slides: [],
        };
        try {
            const exists = fs.existsSync(filePath);
            if (!exists) {
                this.logger.warn(`PPTX file not found: ${filePath}`);
                return result;
            }
            let PptxGenJS;
            try {
                PptxGenJS = require('pptxjs');
            }
            catch {
                this.logger.warn('pptxjs not installed, PPT parsing skipped');
                return result;
            }
            if (typeof PptxGenJS === 'function') {
                const pptx = new PptxGenJS();
                await pptx.readFile(filePath);
                const slides = [];
                if (pptx.Slides && Array.isArray(pptx.Slides)) {
                    for (const slide of pptx.Slides) {
                        const texts = [];
                        if (slide.Shapes && Array.isArray(slide.Shapes)) {
                            for (const shape of slide.Shapes) {
                                if (shape.TextBody && Array.isArray(shape.TextBody)) {
                                    for (const tb of shape.TextBody) {
                                        if (tb.Runs && Array.isArray(tb.Runs)) {
                                            for (const run of tb.Runs) {
                                                if (run.text)
                                                    texts.push(String(run.text));
                                            }
                                        }
                                    }
                                }
                                else if (shape.text) {
                                    texts.push(String(shape.text));
                                }
                            }
                        }
                        slides.push(texts.join(' ').trim());
                    }
                }
                result.slides = slides.filter((s) => s.length > 0);
                result.title = result.slides[0]?.slice(0, 40) || path.basename(filePath);
            }
            this.logger.log(`Parsed PPTX: ${result.slides.length} slides`);
        }
        catch (err) {
            this.logger.warn(`parsePptx failed: ${err.message}`);
        }
        return result;
    }
    async parseExcel(filePath) {
        const result = { sheets: {}, summary: {} };
        try {
            const exists = fs.existsSync(filePath);
            if (!exists) {
                this.logger.warn(`Excel file not found: ${filePath}`);
                return result;
            }
            const wb = XLSX.readFile(filePath);
            for (const sheetName of wb.SheetNames) {
                const ws = wb.Sheets[sheetName];
                result.sheets[sheetName] = XLSX.utils.sheet_to_json(ws, { defval: '' });
            }
            const firstSheet = Object.values(result.sheets)[0];
            if (Array.isArray(firstSheet) && firstSheet.length > 0) {
                const rowCount = firstSheet.length;
                const colCount = Object.keys(firstSheet[0] || {}).length;
                result.summary = {
                    rowCount,
                    colCount,
                    headers: Object.keys(firstSheet[0] || {}),
                };
            }
            this.logger.log(`Parsed Excel: ${wb.SheetNames.length} sheets`);
        }
        catch (err) {
            this.logger.warn(`parseExcel failed: ${err.message}`);
        }
        return result;
    }
    async parseApplicationForm(filePath) {
        const result = { fileName: '', extracted: {} };
        try {
            const exists = fs.existsSync(filePath);
            if (!exists) {
                this.logger.warn(`Application file not found: ${filePath}`);
                return result;
            }
            result.fileName = path.basename(filePath);
            const ext = path.extname(filePath).toLowerCase();
            if (ext === '.pdf') {
                result.extracted = { note: 'PDF 申请表暂未支持文字自动提取，请以进件表字段为准' };
            }
            else if (ext === '.docx' || ext === '.doc') {
                result.extracted = { note: 'Word 申请表暂未支持文字自动提取，请以进件表字段为准' };
            }
            else if (ext === '.xlsx' || ext === '.xls') {
                const excel = await this.parseExcel(filePath);
                result.extracted = excel.summary;
                result.sheets = excel.sheets;
            }
            this.logger.log(`Parsed application form: ${ext}`);
        }
        catch (err) {
            this.logger.warn(`parseApplicationForm failed: ${err.message}`);
        }
        return result;
    }
};
exports.DocumentParserService = DocumentParserService;
exports.DocumentParserService = DocumentParserService = DocumentParserService_1 = __decorate([
    (0, common_1.Injectable)()
], DocumentParserService);
//# sourceMappingURL=document-parser.service.js.map