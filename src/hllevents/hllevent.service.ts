import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { HLLEvent, IHLLEvent, Member } from '../typeorm/entities';
import { EnrolmentView } from '../typeorm/views/enrolment.view';
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
    @InjectEntityManager() private entityManager: EntityManager,
  ) {}

  getAll(): Promise<IHLLEvent[]> {
    return this.eventRepository.getAll();
  }

  async getEventById(id: number, userId?: string): Promise<HLLEvent> {
    const event = await this.eventRepository.getEventById(id);
    if (!event) throw new NotFoundException(`Event with id '${id}' not found.`);
    if (userId)
      event['enrolment'] = await this.entityManager.findOne(EnrolmentView, {
        where: { memberId: userId, eventId: id },
      });
    return event;
  }

  async patchEvent(id: number, dto: HLLEventUpdateWrapperDto) {
    const event = await this.getEventById(id);
    if (dto.control?.organisator) {
      dto.data['organisator'] = await this.getMemberById(dto.control.organisator);
    }

    Object.entries(dto.data)
      .filter(([, value]) => value !== undefined)
      .forEach(([key, value]) => {
        event[key] = value;
      });

    await event.save();

    this.discordService.updateInformationMessage(event);
    return event;
  }

  async createEvent(dto: HLLEventCreateWrapperDto): Promise<HLLEvent> {
    let event = this.eventRepository.create();

    const organisator = await this.getMemberById(dto.control.organisator);
    event.organisatorId = organisator.id;
    Object.entries(dto.data).forEach(([key, value]) => {
      event[key] = value;
    });
    const id = (await this.eventRepository.save(event)).id;
    event = await this.eventRepository.getEventById(id);
    if (dto.control.publish) this.discordService.publishMessages(event);

    return event;
  }

  async switchSquadVisibility(eventId: number, showSquads: boolean) {
    await this.eventRepository.update(eventId, { showSquads });
    const event = await this.getEventById(eventId);
    return this.discordService.updateEnrolmentMessage(event);
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
