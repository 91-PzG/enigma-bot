import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HLLEvent, IHLLEvent, Member } from '../entities';
import { UsersService } from '../users/users.service';
import { HLLEventCreateWrapperDto } from './dtos/hlleventCreate.dto';
import { HLLEventUpdateWrapperDto } from './dtos/hlleventUpdate.dto';

@Injectable()
export class HLLEventService {
  constructor(
    @InjectRepository(HLLEvent)
    private eventRepository: Repository<HLLEvent>,
    private userService: UsersService,
  ) {}

  getAll(): Promise<IHLLEvent[]> {
    return this.eventRepository
      .createQueryBuilder('event')
      .select([
        'event.id',
        'event.name',
        'event.date',
        'event.locked',
        'event.description',
        'event.closed',
        'event.playerCount',
        'event.maxPlayerCount',
        'event.registerByDate',
      ])
      .getMany();
  }

  async getEventById(id: number): Promise<HLLEvent> {
    const event = await this.eventRepository.findOne(id);
    if (!event) throw new NotFoundException(`Event with id '${id}' not found.`);
    return event;
  }

  async patchEvent(id: number, dto: HLLEventUpdateWrapperDto) {
    const event = await this.getEventById(id);
    if (dto.control.organisator) {
      dto.data['organisator'] = await this.getMemberById(
        dto.control.organisator,
      );
    }
    Object.entries(dto.data).forEach(([key, value]) => {
      event[key] = value;
    });
    return event.save();
  }

  async createEvent(dto: HLLEventCreateWrapperDto): Promise<HLLEvent> {
    const event = this.eventRepository.create();
    event.organisator = await this.getMemberById(dto.control.organisator);
    Object.entries(dto.data).forEach(([key, value]) => {
      event[key] = value;
    });

    return event.save();
  }

  private async getMemberById(id: string): Promise<Member> {
    try {
      const user = await this.userService.getMemberById(id);
      return user;
    } catch (error) {
      throw new BadRequestException('Invalid Organisator');
    }
  }
}
