import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Enrolment, HLLEvent } from '.';

@Entity()
export class Squad extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  position: number;

  @ManyToOne(() => HLLEvent)
  event: HLLEvent;

  @Column()
  eventId: number;

  members: Enrolment[];
}
