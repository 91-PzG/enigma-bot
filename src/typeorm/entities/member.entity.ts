import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Division } from '.';
import { AccessRoles } from './accessRoles.enum';
import { Contact } from './contact.entity';
import { Rank } from './rank.enum';

@Entity()
export class Member extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  recruitSince: Date;

  @Column({ nullable: true })
  recruitTill?: Date;

  @Column({ nullable: true })
  memberSince?: Date;

  @Column({ nullable: true })
  memberTill?: Date;

  @Column({ default: false })
  reserve: boolean;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: 0 })
  missedEvents: number;

  @Column({ default: 0 })
  missedConsecutiveEvents: number;

  @Column({ default: false })
  honoraryMember: boolean;

  @Column({
    type: 'enum',
    enum: Division,
  })
  division: Division;

  @Column({
    type: 'enum',
    enum: Rank,
  })
  rank: Rank;

  @Column({
    type: 'enum',
    array: true,
    enum: AccessRoles,
    default: [AccessRoles.MEMBER],
  })
  roles: AccessRoles[];

  @OneToOne(() => Contact, { eager: true })
  @JoinColumn()
  contact: Contact;

  @Column()
  contactId: string;
}
