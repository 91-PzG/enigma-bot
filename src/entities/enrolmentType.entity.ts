import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class EnrolmentType extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  type: string;
}
