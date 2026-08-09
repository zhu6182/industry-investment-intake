import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export type FollowUpMethod = 'phone' | 'wechat' | 'email' | 'onsite' | 'other';
export type FollowUpResult =
  | 'interested'
  | 'negotiating'
  | 'pending_decision'
  | 'not_interested'
  | 'undecided';

@Entity('follow_ups')
export class FollowUp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  intakeId: number;

  @Column({ enum: ['phone', 'wechat', 'email', 'onsite', 'other'] })
  method: FollowUpMethod;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp' })
  followDate: Date;

  @Column({ type: 'simple-json', nullable: true })
  photos: string[];

  @Column({
    enum: ['interested', 'negotiating', 'pending_decision', 'not_interested', 'undecided'],
    default: 'undecided',
  })
  result: FollowUpResult;

  @Column({ nullable: true })
  nextStep: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'operatorId' })
  operator: User;
}
