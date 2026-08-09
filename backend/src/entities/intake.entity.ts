import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { IntakeFile } from './intake-file.entity';

export type IntakeStatus =
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'assigned'
  | 'following'
  | 'landed'
  | 'lost';

@Entity('intakes')
export class Intake {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  creditCode: string;

  @Column({ nullable: true })
  legalPerson: string;

  @Column({ nullable: true })
  establishDate: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ type: 'text', nullable: true })
  shareholders: string;

  @Column({ nullable: true })
  applicationRegionId: number;

  @Column({
    type: 'real',
    nullable: true,
  })
  area: number;

  @Column({
    enum: ['pending', 'rejected', 'approved', 'assigned', 'following', 'landed', 'lost'],
    default: 'pending',
  })
  status: IntakeStatus;

  @Column({ nullable: true })
  rejectReason: string;

  @Column({ type: 'simple-json', nullable: true })
  tycValidation: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'applicantId' })
  applicant: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @OneToMany(() => IntakeFile, (f) => f.intake)
  files: IntakeFile[];
}
