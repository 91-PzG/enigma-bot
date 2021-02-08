import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HllEvent {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  date: Date;
  @Column()
  locked: boolean;
  @Column()
  closed: boolean;
  @Column({ default: 0 })
  playerCount: number;
  @Column()
  maxPlayerCount: number;
  @Column()
  registerByDate: Date;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}
