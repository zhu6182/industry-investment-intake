export interface CompanySearchResult {
    id: string | number;
    name: string;
    creditCode?: string;
    legalPersonName?: string;
    startDate?: string;
    status?: string;
}
export interface Shareholder {
    name: string;
    ratio?: number | string;
    subscribeAmount?: string;
}
export interface CompanyDetail {
    id: string | number;
    name: string;
    creditCode?: string;
    legalPersonName?: string;
    startDate?: string;
    status?: string;
    registeredCapital?: string;
    industry?: string;
    shareholders?: Shareholder[];
}
export interface RiskInfo {
    hasExecution: boolean;
    hasDishonesty: boolean;
    hasLawsuit: boolean;
    isRevoked: boolean;
    executionCount: number;
    riskLevel: 'low' | 'medium' | 'high';
}
export interface RatingBreakdown {
    total: number;
    age: number;
    ageMax: number;
    registeredCapital: number;
    registeredCapitalMax: number;
    status: number;
    statusMax: number;
    risk: number;
    riskMax: number;
    industry: number;
    industryMax: number;
    tags: string[];
}
export interface ValidationResult {
    isValid: boolean;
    reasons: string[];
    rating: number;
    ratingBreakdown?: RatingBreakdown;
    risk?: RiskInfo;
    source?: 'mcp';
    company: {
        name: string;
        creditCode?: string;
        legalPerson?: string;
        establishDate?: string;
        status?: string;
        registeredCapital?: string;
        industry?: string;
        shareholders: Shareholder[];
    };
}
export interface TycApiResponse<T = unknown> {
    state?: string | number;
    errorMsg?: string;
    data?: T;
    [key: string]: unknown;
}
