import { User } from './user.entity';
import { Intake } from './intake.entity';
export type ReferralType = 'referrer' | 'inviter' | 'partner';
export declare class Referral {
    id: number;
    referrerId: number;
    intakeId: number;
    type: ReferralType;
    createdAt: Date;
    referrer: User;
    intake: Intake;
}
