import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Division, HLLEvent } from '.';
import { Enrolment } from './enrolment.entity';

@Entity()
export class Squad extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  position: number;

  @Column({
    type: 'enum',
    enum: Division,
  })
  division: Division;

  @ManyToOne(() => HLLEvent)
  event: HLLEvent;

  @OneToMany(() => Enrolment, (enrolment) => enrolment.squad, {
    eager: true,
  })
  members: Enrolment[];
}
