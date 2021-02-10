import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HllEvent extends BaseEntity {
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

  //Organisator

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
  maxPlayerCount: string;

  @Column({ nullable: true })
  briefing: Date;
}
