import { EntityRepository, Repository } from 'typeorm';
import { HLLEvent, IHLLEvent } from '../postgres/entities';

@EntityRepository(HLLEvent)
export class HLLEventRepository extends Repository<HLLEvent> {
  getEventById(id: number): Promise<HLLEvent | undefined> {
    return this.findOne(id);
  }

  getAll(): Promise<IHLLEvent[]> {
    return this.createQueryBuilder()
      .select([
        'id',
        'name',
        'date',
        'locked',
        'description',
        'closed',
        'playerCount',
        'maxPlayerCount',
        'registerByDate',
      ])
      .getMany();
  }

  getPublishableEvents(): Promise<HLLEvent[]> {
    return this.createQueryBuilder()
      .where('autoPublishDate < :date', { date: new Date() })
      .getMany();
  }
}
