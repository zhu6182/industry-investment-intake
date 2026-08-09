import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('duplicate_check_logs')
@Index(['companyName'])
@Index(['createdAt'])
@Index(['checkerPhone'])
@Index(['intakeId'])
export class DuplicateCheckLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string;

  @Column()
  intakeId: number;

  @Column()
  intakeCompanyName: string;

  @Column()
  intakeStatus: string;

  @Column()
  intakeCreatedAt: Date;

  @Column()
  checkerId: number;

  @Column()
  checkerName: string;

  @Column()
  checkerPhone: string;

  @Column({ nullable: true })
  sourceIp: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'checkerId' })
  checker: User;
}
