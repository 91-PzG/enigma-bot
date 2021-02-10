import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AccessRole extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}
