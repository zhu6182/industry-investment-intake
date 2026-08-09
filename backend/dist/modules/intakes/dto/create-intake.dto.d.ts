export declare class CreateIntakeDto {
    companyName: string;
    creditCode?: string;
    legalPerson?: string;
    establishDate?: string;
    industry?: string;
    shareholders?: string;
    applicationRegionId?: number;
    area?: number;
    referrerId?: number;
    referralType?: 'referrer' | 'inviter' | 'partner';
}
