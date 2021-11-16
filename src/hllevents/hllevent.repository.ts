import { EntityRepository, Repository } from 'typeorm';
import { HLLEvent, IHLLEvent } from '../typeorm/entities';

const MILLISECONDS_IN_DAY = 60 * 60 * 24 * 1000;

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

  getReminderEventsOne(): Promise<HLLEvent[]> {
    return this.createQueryBuilder('event')
      .leftJoinAndSelect('event.discordEvent', 'discordEvent')
      .where('event.registerByDate < :date ', { date: new Date(new Date().valueOf() + 3600 * 24) })
      .andWhere('event.closed = false and event.sentReminderOne = false and event.mandatory = true')
      .getMany();
  }

  getReminderEventsTwo(): Promise<HLLEvent[]> {
    return this.createQueryBuilder('event')
      .leftJoinAndSelect('event.discordEvent', 'discordEvent')
      .where('event.date < :date ', { date: new Date(new Date().valueOf() + 3600 * 24 * 1000) })
      .andWhere('event.closed = false and event.sentReminderTwo = false')
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

  setReminderOne(id: number) {
    this.createQueryBuilder()
      .update(HLLEvent)
      .set({ sentReminderOne: true })
      .where('id = :id', { id })
      .execute();
  }
  setReminderTwo(id: number) {
    this.createQueryBuilder()
      .update(HLLEvent)
      .set({ sentReminderTwo: true })
      .where('id = :id', { id })
      .execute();
  }
}
