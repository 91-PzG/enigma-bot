import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HllEvent } from './hllevent.entity';

@Entity()
export class HllDiscordEvent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channelId: string;

  @Column()
  eventMsg: string;

  @Column()
  registrationMsg: string;

  @OneToOne(() => HllEvent)
  @JoinColumn()
  event: HllEvent;
}
