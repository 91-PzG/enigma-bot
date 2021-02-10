import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { HllEvent } from '.';
import { Division } from './division.entitiy';
import { Enrolment } from './enrolment.entity';

@Entity()
export class Squad extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  position: number;

  @ManyToOne(() => Division)
  division: Division;

  @ManyToOne(() => HllEvent)
  event: HllEvent;

  @OneToMany(() => Enrolment, (enrolment) => enrolment.squad, {
    eager: true,
  })
  members: Enrolment[];
}
