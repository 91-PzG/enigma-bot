import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { On } from 'discord-nestjs';
import { Message } from 'discord.js';
import { DiscordService } from '../../discord/discord.service';
import { HLLEvent } from '../../postgres/entities';
import { HLLEventRepository } from '../hllevent.repository';
import { HLLDiscordEventRepository } from './hlldiscordevent.repository';
import { EnrolmentMessageFactory } from './messages/enrolmentMessage.factory';
import { InformationMessageFactory } from './messages/informationMessage.factory';
import { RegistrationManager } from './registration/registration.manager';
import { ReminderService } from './reminder/reminder.service';

@Injectable()
export class HLLEventsDiscordService {
  constructor(
    private discordService: DiscordService,
    private discordRepository: HLLDiscordEventRepository,
    private eventRepository: HLLEventRepository,
    private informationMessageFactory: InformationMessageFactory,
    private enrolmentMessageFactory: EnrolmentMessageFactory,
    private registrationManager: RegistrationManager,
    private reminderService: ReminderService,
  ) {}

  @On({ event: 'ready' })
  async getOpenEvents() {
    const events = await this.eventRepository.getOpenEvents();

    events.forEach((event) => {
      this.registrationManager.addEvent(event, this);
    });
  }

  async publishMessages(event: HLLEvent) {
    const channel = await this.discordService.createEventChannelIfNotExists(event.channelName);

    const informationMessage = this.informationMessageFactory.createMessage(event);
    const enrolmentMessage = await this.enrolmentMessageFactory.createMessage(event);

    const informationId = (await channel.send({ embeds: [informationMessage] })).id;
    const enrolmentId = (await channel.send({ embeds: [enrolmentMessage] })).id;

    event.discordEvent = await this.discordRepository.createEntity(
      channel.id,
      informationId,
      enrolmentId,
    );

    //@ts-ignore
    event.autoPublishDate = null;
    event.save();

    this.registrationManager.addEvent(event, this);
  }

  async updateInformationMessage(event: HLLEvent): Promise<boolean> {
    const discordEvent = await this.discordRepository.findOne(event.discordEventId);
    if (!discordEvent) return false;

    let oldMessage = await this.getMessageFromDiscord(
      event,
      discordEvent.channelId,
      discordEvent.informationMsg,
    );
    if (!oldMessage) return false;

    const newMessage = this.informationMessageFactory.createMessage(event);
    oldMessage.edit({ embeds: [newMessage] });
    return true;
  }

  async updateEnrolmentMessage(event: HLLEvent): Promise<boolean> {
    const discordEvent = await this.discordRepository.findOne(event.discordEventId);
    if (!discordEvent) return false;

    if (typeof event.organisator != 'string') {
      //@ts-ignore
      event.organisator = event.organisator?.name || 'error';
    }

    let oldMessage = await this.getMessageFromDiscord(
      event,
      discordEvent.channelId,
      discordEvent.enrolmentMsg,
    );
    if (!oldMessage) return false;

    const newMessage = await this.enrolmentMessageFactory.createMessage(event);
    oldMessage.edit({ embeds: [newMessage] });
    return true;
  }

  private async getMessageFromDiscord(
    event: HLLEvent,
    channel: string,
    message: string,
  ): Promise<Message | undefined> {
    try {
      return await this.discordService.getMessageById(message, channel, true);
    } catch (error) {
      event.closed = true;
      event.save();
      return;
    }
  }

  @Cron('*/5 * * * *')
  async checkEvents() {
    this.eventRepository.getPublishableEvents().then((events) => {
      events.forEach((event) => {
        //@ts-ignore
        event.organisator = event.organisator.name;
        this.publishMessages(event);
      });
    });
    this.eventRepository.getLockableEvents().then((events) => {
      events.forEach((event) => {
        event.locked = true;
        event.save();
        this.registrationManager.editEvent(event);
      });
    });
    this.eventRepository.getClosableEvents().then((events) => {
      events.forEach((event) => {
        event.closed = true;
        event.save();
        this.registrationManager.closeEvent(event.id);
      });
    });
    this.eventRepository.getReminderEventsOne().then((events) => {
      events.forEach((event) => {
        this.eventRepository.setReminderOne(event.id);
        this.reminderService.getMissingEnrolmentOne(event);
      });
    });
    this.eventRepository.getReminderEventsTwo().then((events) => {
      events.forEach((event) => {
        this.eventRepository.setReminderTwo(event.id);
        this.reminderService.getMissingEnrolmentTwo(event);
      });
    });
  }
}
