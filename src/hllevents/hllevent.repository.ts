import { EntityRepository, Repository } from 'typeorm';
import { HLLEvent, IHLLEvent } from '../postgres/entities';

@EntityRepository(HLLEvent)
export class HLLEventRepository extends Repository<HLLEvent> {
  getEventById(id: number): Promise<HLLEvent | undefined> {
    return this.findOne(id);
  }

  getAll(): Promise<IHLLEvent[]> {
    return this.createQueryBuilder('event')
      .addSelect('event.id')
      .select(['id', 'name', 'date', 'locked', 'description', 'closed', '"registerByDate"'])
      .addSelect('CONCAT(event.playerCount,\'/\',event."maxPlayerCount")', 'players')
      .getRawMany();
  }

  getPublishableEvents(): Promise<HLLEvent[]> {
    return this.createQueryBuilder('e')
      .leftJoinAndSelect('e.organisator', 'orga')
      .where('"autoPublishDate" < :date', { date: new Date() })
      .getMany();
  }

  getOpenEvents(): Promise<HLLEvent[]> {
    return this.createQueryBuilder('event')
      .leftJoinAndSelect('event.discordEvent', 'discordEvent')
      .where('event."autoPublishDate" IS NULL')
      .andWhere('event.closed = false')
      .andWhere('event."discordEventId" IS NOT NULL')
      .getMany();
  }
}
