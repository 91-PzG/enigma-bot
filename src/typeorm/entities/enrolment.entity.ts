import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EnrolByDiscordDto } from '../../enrolments/dto/enrolByDiscord.dto';
import { Division } from './division.enum';
import { EnrolmentType } from './enrolmentType.enum';
import { HLLEvent } from './hllevent.entity';
import { HLLRole } from './hllRole.enum';
import { Member } from './member.entity';

@Entity()
export class Enrolment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  squadlead: boolean;

  @Column({ default: false })
  commander: boolean;

  @Column()
  timestamp: Date;

  @Column({ nullable: true })
  position: number;

  @Column({ nullable: true })
  username: string;

  @ManyToOne(() => HLLEvent)
  event?: HLLEvent;

  @Column()
  eventId: number;

  @ManyToOne(() => Member, { nullable: true })
  member?: Member;

  @Column({ nullable: true })
  memberId: string;

  @Column({
    type: 'enum',
    enum: Division,
  })
  division: Division;

  @Column({
    type: 'enum',
    enum: EnrolmentType,
  })
  enrolmentType: EnrolmentType;

  @Column({ nullable: true })
  squadId: number;

  @Column({
    type: 'enum',
    enum: HLLRole,
    nullable: true,
  })
  role: HLLRole;

  @Column({
    default: false,
  })
  isPresent: boolean;

  assignDto(dto: EnrolByDiscordDto) {
    this.squadlead = dto.squadlead;
    this.commander = dto.commander;
    this.username = dto.member.contact.name;
    this.enrolmentType = dto.type;
    this.division = dto.division;
    this.eventId = dto.eventId;
    this.memberId = dto.member.id;
  }
}
