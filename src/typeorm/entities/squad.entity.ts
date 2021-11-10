import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Division, Enrolment, HLLEvent } from '.';

@Entity()
export class Squad extends BaseEntity {
  @PrimaryGeneratedColumn()
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

  @Column()
  eventId: number;

  members: Enrolment[];
}
