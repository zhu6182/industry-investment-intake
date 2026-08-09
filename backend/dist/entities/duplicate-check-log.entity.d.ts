import { User } from './user.entity';
export declare class DuplicateCheckLog {
    id: number;
    companyName: string;
    intakeId: number;
    intakeCompanyName: string;
    intakeStatus: string;
    intakeCreatedAt: Date;
    checkerId: number;
    checkerName: string;
    checkerPhone: string;
    sourceIp: string;
    createdAt: Date;
    checker: User;
}
