import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HllDiscordEvent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channelId: string;

  @Column()
  informationMsg: string;

  @Column()
  enrolmentMsg: string;
}
