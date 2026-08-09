export interface UploadedFileInfo {
    url: string;
    size: number;
    originalName: string;
    storedName: string;
    mimetype: string;
}
export declare class UploadService {
    private readonly logger;
    private readonly uploadDir;
    private readonly baseUrl;
    constructor();
    private ensureDir;
    private validateFile;
    saveFile(file: Express.Multer.File): Promise<UploadedFileInfo>;
    saveFiles(files: Express.Multer.File[]): Promise<UploadedFileInfo[]>;
}
