import { Intake } from './intake.entity';
export type IntakeFileType = 'application' | 'ppt' | 'data_sheet' | 'photo';
export declare class IntakeFile {
    id: number;
    type: IntakeFileType;
    originalName: string;
    storedName: string;
    url: string;
    size: number;
    uploadedAt: Date;
    intake: Intake;
}
