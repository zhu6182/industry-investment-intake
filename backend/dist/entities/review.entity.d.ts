import { User } from './user.entity';
export type ReviewAction = 'approve' | 'reject';
export declare class Review {
    id: number;
    intakeId: number;
    action: ReviewAction;
    reason: string;
    createdAt: Date;
    reviewer: User;
    assignedToId: number;
}
