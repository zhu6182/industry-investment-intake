import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  level: number;

  @Column({ nullable: true })
  parentId: number | null;

  @ManyToOne(() => Region, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Region;
}
