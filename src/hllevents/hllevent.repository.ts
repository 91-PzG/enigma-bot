import { EntityRepository, Repository } from 'typeorm';
import { HLLEvent, IHLLEvent } from '../postgres/entities';

@EntityRepository(HLLEvent)
export class HLLEventRepository extends Repository<HLLEvent> {
  getEventById(id: number): Promise<HLLEvent | undefined> {
    return this.createQueryBuilder('event')
      .leftJoinAndSelect('event.organisator', 'orga')
      .where('event.id = :id', { id })
      .getOne();
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
      .where('e.autoPublishDate < :date', { date: new Date() })
      .andWhere('e.closed = false')
      .getMany();
  }

  getLockableEvents(): Promise<HLLEvent[]> {
    return this.createQueryBuilder('e')
      .leftJoinAndSelect('e.organisator', 'orga')
      .where('e.registerByDate < :date', { date: new Date() })
      .andWhere('e.locked = false')
      .andWhere('e.closed = false')
      .getMany();
  }

  getClosableEvents(): Promise<HLLEvent[]> {
    return this.createQueryBuilder('e')
      .leftJoinAndSelect('e.organisator', 'orga')
      .where('e.date < :date', { date: new Date() })
      .andWhere('e.closed = false')
      .getMany();
  }

  getReminderEvents(): Promise<HLLEvent[]> {
    return this.createQueryBuilder('e')
      .where('e.registerByDate < :date ', { date: (new Date().valueOf())-3600*24 })
      .andWhere('e.closed = false')
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
