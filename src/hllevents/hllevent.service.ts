import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HLLEvent, HllEventEntity } from '../entities';

@Injectable()
export class HllEventService {
  constructor(
    @InjectRepository(HllEventEntity)
    private eventRepository: Repository<HllEventEntity>,
  ) {}

  getAll(): Promise<HLLEvent[]> {
    return this.eventRepository
      .createQueryBuilder('event')
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

  async getEventById(id: number): Promise<HLLEvent> {
    const event = await this.eventRepository.findOne(id);
    if (!event) throw new NotFoundException(`Event with id '${id}' not found.`);
    return event;
  }
}
