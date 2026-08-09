import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

@Injectable()
export class DocumentParserService {
  private readonly logger = new Logger(DocumentParserService.name);

  async parsePptx(
    filePath: string,
  ): Promise<{ title: string; slides: string[] }> {
    const result: { title: string; slides: string[] } = {
      title: '',
      slides: [],
    };

    try {
      const exists = fs.existsSync(filePath);
      if (!exists) {
        this.logger.warn(`PPTX file not found: ${filePath}`);
        return result;
      }

      let PptxGenJS: any;
      try {
        PptxGenJS = require('pptxjs');
      } catch {
        this.logger.warn('pptxjs not installed, PPT parsing skipped');
        return result;
      }

      if (typeof PptxGenJS === 'function') {
        const pptx = new PptxGenJS();
        await pptx.readFile(filePath);
        const slides: string[] = [];
        if (pptx.Slides && Array.isArray(pptx.Slides)) {
          for (const slide of pptx.Slides) {
            const texts: string[] = [];
            if (slide.Shapes && Array.isArray(slide.Shapes)) {
              for (const shape of slide.Shapes) {
                if (shape.TextBody && Array.isArray(shape.TextBody)) {
                  for (const tb of shape.TextBody) {
                    if (tb.Runs && Array.isArray(tb.Runs)) {
                      for (const run of tb.Runs) {
                        if (run.text) texts.push(String(run.text));
                      }
                    }
                  }
                } else if (shape.text) {
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
    } catch (err) {
      this.logger.warn(`parsePptx failed: ${(err as Error).message}`);
    }

    return result;
  }

  async parseExcel(filePath: string): Promise<Record<string, any>> {
    const result: Record<string, any> = { sheets: {}, summary: {} };

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

      const firstSheet = Object.values(result.sheets)[0] as any[];
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
    } catch (err) {
      this.logger.warn(`parseExcel failed: ${(err as Error).message}`);
    }

    return result;
  }

  async parseApplicationForm(
    filePath: string,
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = { fileName: '', extracted: {} };

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
      } else if (ext === '.docx' || ext === '.doc') {
        result.extracted = { note: 'Word 申请表暂未支持文字自动提取，请以进件表字段为准' };
      } else if (ext === '.xlsx' || ext === '.xls') {
        const excel = await this.parseExcel(filePath);
        result.extracted = excel.summary;
        result.sheets = excel.sheets;
      }

      this.logger.log(`Parsed application form: ${ext}`);
    } catch (err) {
      this.logger.warn(`parseApplicationForm failed: ${(err as Error).message}`);
    }

    return result;
  }
}
