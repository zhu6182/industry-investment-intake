import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Intake } from './intake.entity';

export type IntakeFileType = 'application' | 'ppt' | 'data_sheet' | 'photo';

@Entity('intake_files')
export class IntakeFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ['application', 'ppt', 'data_sheet', 'photo'] })
  type: IntakeFileType;

  @Column()
  originalName: string;

  @Column()
  storedName: string;

  @Column()
  url: string;

  @Column({ type: 'integer' })
  size: number;

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => Intake, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'intakeId' })
  intake: Intake;
}
