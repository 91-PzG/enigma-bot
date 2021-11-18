import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HLLEvent } from './hllevent.entity';

@Entity()
export class Mappoll extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HLLEvent)
  event: HLLEvent;

  @Column({ nullable: true })
  eventId: number;
}
