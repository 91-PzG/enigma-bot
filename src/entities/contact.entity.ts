import { BaseEntity, Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { Member } from './member.entity';

@Entity()
export class Contact extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  comment: string;

  @OneToOne(() => Member, { nullable: true })
  member: Member;
}
