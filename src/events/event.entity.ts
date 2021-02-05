import { Entity, PrimaryKey, Property } from 'mikro-orm';

@Entity({ tableName: 'events' })
export class Event {
  @PrimaryKey()
  id: number;
  @Property()
  name: string;
  @Property()
  description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}
