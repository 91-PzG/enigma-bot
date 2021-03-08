import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Division } from './division.enum';
import { EnrolmentType } from './enrolmentType.enum';
import { HLLEvent } from './hllevent.entity';
import { HLLRole } from './hllRole.enum';
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

  @ManyToOne(() => HLLEvent)
  event: HLLEvent;

  @ManyToOne(() => Member, { nullable: true })
  member: Member;

  @Column({
    type: 'enum',
    enum: Division,
  })
  division: Division;

  @Column({
    type: 'enum',
    enum: EnrolmentType,
  })
  enrolmentType: EnrolmentType;

  @ManyToOne(() => Squad, { nullable: true })
  squad: Squad;

  @Column({
    type: 'enum',
    enum: HLLRole,
    nullable: true,
  })
  role: HLLRole;
}
