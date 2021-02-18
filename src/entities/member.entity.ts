import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Division } from '.';
import { AccessRole } from './accessRoles.entity';
import { Contact } from './contact.entity';
import { Rank } from './rank.entity';

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

  @Column()
  reserve: boolean;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: 0 })
  missedEvents: number = 0;

  @Column({ default: 0 })
  missedConsecutiveEvents: number = 0;

  @ManyToOne(() => Division)
  division: Division;

  @ManyToOne(() => Rank)
  rank: Rank;

  @ManyToMany(() => AccessRole, { eager: true })
  @JoinTable()
  roles: AccessRole[];

  @OneToOne(() => Contact, { eager: true })
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
}
