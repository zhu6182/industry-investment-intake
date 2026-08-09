import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
export interface UserWithRoles {
    id: number;
    regionId?: number | null;
    roles?: Array<{
        code: string;
        dataScope: 'self' | 'team' | 'region' | 'all';
    }>;
}
export declare function applyDataScope<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, user: UserWithRoles, alias?: string, options?: {
    createdByColumn?: string;
    regionColumn?: string;
    teamMemberIds?: number[];
}): SelectQueryBuilder<T>;
