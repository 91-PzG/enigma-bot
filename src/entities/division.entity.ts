import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Division extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}
