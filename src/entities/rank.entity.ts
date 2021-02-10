import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Rank extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}
