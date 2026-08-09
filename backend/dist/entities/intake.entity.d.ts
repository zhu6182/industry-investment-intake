import { User } from './user.entity';
import { IntakeFile } from './intake-file.entity';
export type IntakeStatus = 'pending' | 'rejected' | 'approved' | 'assigned' | 'following' | 'landed' | 'lost';
export declare class Intake {
    id: number;
    companyName: string;
    creditCode: string;
    legalPerson: string;
    establishDate: string;
    industry: string;
    shareholders: string;
    applicationRegionId: number;
    area: number;
    status: IntakeStatus;
    rejectReason: string;
    tycValidation: any;
    createdAt: Date;
    updatedAt: Date;
    applicant: User;
    assignedTo: User;
    files: IntakeFile[];
}
