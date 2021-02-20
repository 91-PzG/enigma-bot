import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HLLEventEntity } from './hllevent.entity';

@Entity()
export class Mapvote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channelId: string;

  @Column()
  massageId: string;

  @ManyToOne(() => HLLEventEntity)
  event: HLLEventEntity;
}
