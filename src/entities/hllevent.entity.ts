import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HllDiscordEvent } from './hlldiscordevent.entity';
import { Member } from './member.entity';

export interface HLLEvent {
  //required
  id: number;
  name: string;
  description: string;
  date: Date;
  registerByDate: Date;
  playerCount: number;
  organisator: Member;
  mandatory: boolean;
  locked: boolean;
  closed: boolean;

  //optional
  rounds?: number;
  hllMap?: string;
  commander?: string;
  moderator?: string;
  duration?: number;
  meetingPoint?: string;
  server?: string;
  password?: string;
  maxPlayerCount?: number;
  briefing?: Date;
}

@Entity('hll_event')
export class HllEventEntity extends BaseEntity implements HLLEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column()
  registerByDate: Date;

  @Column({ default: 0 })
  playerCount: number;

  @ManyToOne(() => Member, { eager: true })
  organisator: Member;

  @Column()
  mandatory: boolean;

  @Column()
  locked: boolean;

  @Column()
  closed: boolean;

  @Column({ nullable: true })
  rounds: number;

  @Column({ nullable: true })
  hllMap: string;

  @Column({ nullable: true })
  commander: string; //member

  @Column({ nullable: true })
  moderator: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  meetingPoint: string;

  @Column({ nullable: true })
  server: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  maxPlayerCount: number;

  @Column({ nullable: true })
  briefing: Date;

  @Column({ nullable: true })
  autoPublishDate: Date;

  @OneToOne(() => HllDiscordEvent, { nullable: true })
  @JoinColumn()
  discordEvent: HllDiscordEvent;
}
