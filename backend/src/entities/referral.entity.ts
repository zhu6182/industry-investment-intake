import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Intake } from './intake.entity';

export type ReferralType = 'referrer' | 'inviter' | 'partner';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  referrerId: number;

  @Column()
  intakeId: number;

  @Column({
    enum: ['referrer', 'inviter', 'partner'],
    default: 'referrer',
  })
  type: ReferralType;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'referrerId' })
  referrer: User;

  @ManyToOne(() => Intake, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'intakeId' })
  intake: Intake;
}
