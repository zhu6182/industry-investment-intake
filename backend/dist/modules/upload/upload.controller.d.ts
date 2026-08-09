import { UploadService, UploadedFileInfo } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(file: Express.Multer.File): Promise<UploadedFileInfo>;
    uploadFiles(files: Express.Multer.File[]): Promise<UploadedFileInfo[]>;
}
