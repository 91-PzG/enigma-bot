import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Contact extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  comment?: string;
}
