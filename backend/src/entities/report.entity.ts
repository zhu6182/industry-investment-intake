import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  intakeId: number;

  @Column()
  pdfPath: string;

  @Column()
  pdfUrl: string;

  @Column({ default: 0 })
  generatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  summary: any;
}
