import { EntityRepository, Repository } from 'typeorm';
import { HllEvent } from '../entities';
import { HllEventGetAllDto } from './dtos/hlleventGetAll.dto';

@EntityRepository(HllEvent)
export class HllEventRepository extends Repository<HllEvent> {
  getAll(): Promise<HllEventGetAllDto[]> {
    const events = this.createQueryBuilder('event')
      .select([
        'event.id',
        'event.name',
        'event.date',
        'event.description',
        'event.locked',
        'event.closed',
        'event.playerCount',
        'event.maxPlayerCount',
        'event.registerByDate',
      ])
      .getMany();

    return events;
  }
}
