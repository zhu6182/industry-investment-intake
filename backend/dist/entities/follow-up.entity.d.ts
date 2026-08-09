import { User } from './user.entity';
export type FollowUpMethod = 'phone' | 'wechat' | 'email' | 'onsite' | 'other';
export type FollowUpResult = 'interested' | 'negotiating' | 'pending_decision' | 'not_interested' | 'undecided';
export declare class FollowUp {
    id: number;
    intakeId: number;
    method: FollowUpMethod;
    content: string;
    followDate: Date;
    photos: string[];
    result: FollowUpResult;
    nextStep: string;
    createdAt: Date;
    operator: User;
}
