import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFileInfo {
  url: string;
  size: number;
  originalName: string;
  storedName: string;
  mimetype: string;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    this.baseUrl = '/uploads';
    this.ensureDir(this.uploadDir);
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('未提供文件');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `不支持的文件类型: ${file.mimetype}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `文件大小超出限制 (最大 ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
      );
    }
  }

  async saveFile(file: Express.Multer.File): Promise<UploadedFileInfo> {
    this.validateFile(file);

    const ext = path.extname(file.originalname) || '';
    const storedName = `${uuidv4()}${ext}`;
    const targetPath = path.join(this.uploadDir, storedName);

    fs.writeFileSync(targetPath, file.buffer);

    this.logger.log(`File saved: ${storedName} (${file.size} bytes)`);

    return {
      url: `${this.baseUrl}/${storedName}`,
      size: file.size,
      originalName: file.originalname,
      storedName,
      mimetype: file.mimetype,
    };
  }

  async saveFiles(files: Express.Multer.File[]): Promise<UploadedFileInfo[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('未提供文件');
    }
    return Promise.all(files.map((f) => this.saveFile(f)));
  }
}
