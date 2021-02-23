import * as bcrypt from 'bcrypt';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Division } from '.';
import { AccessRoles } from './accessRoles.enum';
import { Contact } from './contact.entity';
import { Rank } from './rank.enum';

@Entity()
export class Member extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
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
  missedEvents: number = 0;

  @Column({ default: 0 })
  missedConsecutiveEvents: number = 0;

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

  @Column({
    nullable: true,
    select: false,
  })
  password: string;

  @Column({
    nullable: true,
    select: false,
  })
  salt: string;

  @Column({ default: false })
  mustChangePassword: boolean;

  async validatePassword(password: string): Promise<boolean> {
    if (!password) return false;
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
