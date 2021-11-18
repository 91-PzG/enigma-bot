import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Mappoll } from '.';
import { HLLWarfareMaps } from './maps.enum';

@Entity()
@Index(['pollId', 'memberId'], { unique: true })
export class Mappollvote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Mappoll)
  poll: Mappoll;

  @Column()
  pollId: number;

  @Column()
  memberId: string;

  @Column({
    type: 'enum',
    enum: HLLWarfareMaps,
  })
  map: HLLWarfareMaps;
}
