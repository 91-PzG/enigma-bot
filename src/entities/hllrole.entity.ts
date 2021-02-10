import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class HllRole extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}
