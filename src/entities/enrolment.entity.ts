import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Division } from './division.entity';
import { EnrolmentType } from './enrolmentType.entity';
import { HllEventEntity } from './hllevent.entity';
import { HllRole } from './hllrole.entity';
import { Member } from './member.entity';
import { Squad } from './squad.entity';

@Entity()
export class Enrolment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  squadlead: boolean;

  @Column()
  commander: boolean;

  @Column()
  timestamp: Date;

  @Column()
  position: number;

  @Column({ nullable: true })
  username: string;

  @ManyToOne(() => HllEventEntity)
  event: HllEventEntity;

  @ManyToOne(() => Member, { nullable: true })
  member: Member;

  @ManyToOne(() => Division)
  division: Division;

  @ManyToOne(() => EnrolmentType)
  enrolmentType: Division;

  @ManyToOne(() => Squad)
  squad: Squad;

  @ManyToOne(() => HllRole)
  role: HllRole;
}
