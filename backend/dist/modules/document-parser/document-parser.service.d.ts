export declare class DocumentParserService {
    private readonly logger;
    parsePptx(filePath: string): Promise<{
        title: string;
        slides: string[];
    }>;
    parseExcel(filePath: string): Promise<Record<string, any>>;
    parseApplicationForm(filePath: string): Promise<Record<string, any>>;
}
