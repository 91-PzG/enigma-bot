import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { AccessRole } from './accessRoles.entity';
import { Division } from './division.entitiy';

@Entity()
export class Member extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  recruitSince: Date;

  @Column({ nullable: true })
  recruitTill: Date;

  @Column({ nullable: true })
  memberSince: Date;

  @Column({ nullable: true })
  memberTill: Date;

  @Column()
  reserve: boolean;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 0 })
  missedEvents: number;

  @Column({ default: 0 })
  missedConsecutiveEvents: number;

  @ManyToOne(() => Division)
  division: Division;

  @ManyToMany(() => AccessRole, { eager: true })
  @JoinTable()
  roles: AccessRole[];
}
