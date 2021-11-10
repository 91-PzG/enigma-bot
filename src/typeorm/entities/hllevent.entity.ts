import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Contact } from '.';
import { HllDiscordEvent } from './hlldiscordevent.entity';

export interface IHLLEvent {
  //required
  id: number;
  name: string;
  description: string;
  date: Date;
  registerByDate: Date;
  playerCount: number;
  organisator: Contact;
  mandatory: boolean;
  locked: boolean;
  closed: boolean;
  singlePool: boolean;

  //optional
  rounds?: number;
  hllMap?: string;
  commander?: string;
  moderator?: string;
  duration?: string;
  meetingPoint?: string;
  server?: string;
  password?: string;
  maxPlayerCount?: number;
  briefing?: Date;
}

@Entity('hll_event')
export class HLLEvent extends BaseEntity implements IHLLEvent {
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

  @ManyToOne(() => Contact, { eager: true })
  @JoinColumn()
  organisator: Contact;

  @Column({ nullable: true })
  organisatorId: string;

  @Column()
  mandatory: boolean;

  @Column({ default: false })
  locked: boolean;

  @Column({ default: false })
  closed: boolean;

  @Column()
  singlePool: boolean;

  @Column()
  channelName: string;

  @Column({ nullable: true })
  rounds: number;

  @Column({ nullable: true })
  hllMap: string;

  @Column({ nullable: true })
  faction: string;

  @Column({ nullable: true })
  commander: string;

  @Column({ nullable: true })
  moderator: string;

  @Column({ nullable: true })
  duration: string;

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

  @Column({ nullable: true })
  discordEventId: number;

  @Column({ default: false })
  sentReminderOne: boolean;

  @Column({ default: false })
  sentReminderTwo: boolean;
}
