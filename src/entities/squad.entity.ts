import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Division, HllEventEntity } from '.';
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

  @ManyToOne(() => HllEventEntity)
  event: HllEventEntity;

  @OneToMany(
    () => Enrolment,
    enrolment => enrolment.squad,
    {
      eager: true,
    },
  )
  members: Enrolment[];
}
