export type IntakeStatus = 'pending' | 'rejected' | 'approved' | 'assigned' | 'following' | 'landed' | 'lost';
export declare class UpdateIntakeDto {
    companyName?: string;
    creditCode?: string;
    legalPerson?: string;
    establishDate?: string;
    industry?: string;
    shareholders?: string;
    applicationRegionId?: number;
    area?: number;
    status?: IntakeStatus;
    rejectReason?: string;
    assignedToId?: number;
}
