import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HLLEvent, IHLLEvent, Member } from '../postgres/entities';
import { UsersService } from '../users/users.service';
import { HLLEventsDiscordService } from './discord/hllevent-discord.service';
import { HLLEventCreateWrapperDto } from './dtos/hlleventCreate.dto';
import { HLLEventUpdateWrapperDto } from './dtos/hlleventUpdate.dto';
import { HLLEventRepository } from './hllevent.repository';

@Injectable()
export class HLLEventService {
  constructor(
    private eventRepository: HLLEventRepository,
    private userService: UsersService,
    private discordService: HLLEventsDiscordService,
  ) {}

  getAll(): Promise<IHLLEvent[]> {
    return this.eventRepository.getAll();
  }

  async getEventById(id: number): Promise<HLLEvent> {
    const event = await this.eventRepository.getEventById(id);
    if (!event) throw new NotFoundException(`Event with id '${id}' not found.`);
    return event;
  }

  async patchEvent(id: number, dto: HLLEventUpdateWrapperDto) {
    const event = await this.getEventById(id);
    if (dto.control?.organisator) {
      dto.data['organisator'] = await this.getMemberById(dto.control.organisator);
    }
    Object.entries(dto.data).forEach(([key, value]) => {
      event[key] = value;
    });

    await event.save();

    this.discordService.updateInformationMessage(event);
    return event;
  }

  async createEvent(dto: HLLEventCreateWrapperDto): Promise<HLLEvent> {
    const event = this.eventRepository.create();

    const organisator = await this.getMemberById(dto.control.organisator);
    event.organisatorId = organisator.id;
    Object.entries(dto.data).forEach(([key, value]) => {
      event[key] = value;
    });

    await event.save();
    event.organisator = organisator.contact;

    if (dto.control.publish) this.discordService.publishMessages(event);

    return event;
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
