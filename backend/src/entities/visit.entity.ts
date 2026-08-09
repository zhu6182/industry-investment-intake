import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Region } from './region.entity';

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  intakeId: number;

  @Column()
  visitDate: Date;

  @Column()
  visitLocation: string;

  @Column({ type: 'text' })
  visitContent: string;

  @Column({ type: 'simple-json', nullable: true })
  photos: string[];

  @Column({ nullable: true })
  applicationRegionId: number;

  @Column({
    type: 'float',
    nullable: true,
  })
  area: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'operatorId' })
  operator: User;

  @ManyToOne(() => Region, { nullable: true, eager: true })
  @JoinColumn({ name: 'applicationRegionId' })
  region: Region;
}
