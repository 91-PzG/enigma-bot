import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Contact extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  comment: string;
}
