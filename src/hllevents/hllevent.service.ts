import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HLLEvent, HLLEventEntity, Member } from '../entities';
import { UsersService } from '../users/users.service';
import { HLLEventCreateWrapperDto } from './dtos/hllEventCreate.dto';
import { HLLEventUpdateWrapperDto } from './dtos/hllEventUpdate.dto';

@Injectable()
export class HLLEventService {
  constructor(
    @InjectRepository(HLLEventEntity)
    private eventRepository: Repository<HLLEventEntity>,
    private userService: UsersService,
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

  async getEventById(id: number): Promise<HLLEventEntity> {
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
    await event.save();
  }

  async createEvent(dto: HLLEventCreateWrapperDto): Promise<number> {
    const event = this.eventRepository.create();
    event.organisator = await this.getMemberById(dto.control.organisator);
    Object.entries(dto.data).forEach(([key, value]) => {
      event[key] = value;
    });

    const id = (await event.save()).id;
    return id;
  }

  private async getMemberById(id: string): Promise<Member> {
    const user = await this.userService.getMemberById(id);
    if (!user) throw new BadRequestException('Invalid Organisator');
    return user;
  }
}
