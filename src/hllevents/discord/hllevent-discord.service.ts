import { Once } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import {
  ButtonInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEditOptions,
} from 'discord.js';
import { DiscordService } from '../../discord/discord.service';
import { EnrolmentMessageFactory } from '../../discord/messages/enrolmentMessage.factory';
import { InformationMessageFactory } from '../../discord/messages/informationMessage.factory';
import { HLLEvent } from '../../typeorm/entities';
import { HLLEventRepository } from '../hllevent.repository';
import { HLLDiscordEventRepository } from './hlldiscordevent.repository';

@Injectable()
export class HLLEventsDiscordService {
  private logger = new Logger('HLLEventsDiscordService');

  constructor(
    private discordService: DiscordService,
    private discordRepository: HLLDiscordEventRepository,
    private eventRepository: HLLEventRepository,
    private informationMessageFactory: InformationMessageFactory,
    private enrolmentMessageFactory: EnrolmentMessageFactory,
    private configService: ConfigService,
  ) {}

  @Once('ready')
  async discordCompatibilityUpdate() {
    if (this.configService.get('util.discordCompatibility') !== 'true') return;

    this.logger.warn('Updating existing events using compatibility mode');

    const events = await this.eventRepository.getOpenEvents();
    events.forEach((event) => this.updateEnrolmentMessage(event));
  }

  async publishMessages(event: HLLEvent) {
    const channel = await this.discordService.createEventChannelIfNotExists(event.channelName);

    const informationMessage = this.informationMessageFactory.createMessage(event);
    const enrolmentMessage = await this.enrolmentMessageFactory.createMessage(event);

    const informationId = (await channel.send({ embeds: [informationMessage] })).id;
    const enrolmentId = (
      await channel.send({
        embeds: [enrolmentMessage],
        components: [this.createMessageActionRow(event.id, event.locked, event.closed)],
      })
    ).id;

    const discordEventId = (
      await this.discordRepository.createEntity(channel.id, informationId, enrolmentId)
    ).id;

    this.eventRepository.update(event.id, { discordEventId, autoPublishDate: null });
  }

  async updateInformationMessage(event: HLLEvent): Promise<boolean> {
    const discordEvent = await this.discordRepository.findOne(event.discordEventId);
    if (!discordEvent) return false;

    let oldMessage = await this.getMessageFromDiscord(
      event.id,
      discordEvent.channelId,
      discordEvent.informationMsg,
    );
    if (!oldMessage) return false;

    const newMessage = this.informationMessageFactory.createMessage(event);
    oldMessage.edit({ embeds: [newMessage] });
    return true;
  }

  async updateEnrolmentMessage(event: HLLEvent, interaction?: ButtonInteraction): Promise<boolean> {
    const discordEvent = await this.discordRepository.findOne(event.discordEventId);
    if (!discordEvent) {
      this.logger.debug(`Encountered error fetching discordevent with id ${event.discordEventId}`);
      return false;
    }

    const embed = await this.enrolmentMessageFactory.createMessage(event);
    const newMessage: MessageEditOptions = {
      embeds: [embed],
      components: [this.createMessageActionRow(event.id, event.locked, event.closed)],
    };
    if (interaction) {
      (interaction.message as Message).edit(newMessage);
      return true;
    }

    const oldMessage = await this.getMessageFromDiscord(
      event.id,
      discordEvent.channelId,
      discordEvent.enrolmentMsg,
    );
    if (!oldMessage) {
      return false;
    }
    oldMessage.edit(newMessage);
    return true;
  }

  private async getMessageFromDiscord(
    eventId: number,
    channelId: string,
    messageId: string,
  ): Promise<Message | void> {
    const message = await this.discordService.getMessageById(messageId, channelId, true);
    if (!message) {
      this.eventRepository.update(eventId, { closed: true });
      return;
    }
    return message;
  }

  private createMessageActionRow(
    eventId: number,
    locked: boolean,
    closed: boolean,
  ): MessageActionRow {
    const disabled = locked || closed;
    const emoji = closed
      ? this.configService.get('embed.closedEmoji')
      : locked
      ? this.configService.get('embed.lockedEmoji')
      : '';
    return new MessageActionRow().addComponents(
      new MessageButton({
        customId: `${eventId}-register`,
        style: 'SUCCESS',
        label: 'Anmelden',
        emoji,
        disabled,
      }),
      new MessageButton({
        customId: `${eventId}-squadlead-register`,
        style: 'PRIMARY',
        label: 'Squadlead',
        emoji,
        disabled,
      }),
      new MessageButton({
        customId: `${eventId}-commander-register`,
        style: 'SECONDARY',
        label: 'Kommandant',
        emoji,
        disabled,
      }),
      new MessageButton({
        customId: `${eventId}-cancel-register`,
        style: 'DANGER',
        label: 'Abmelden',
        emoji: closed ? emoji : '',
        disabled: closed,
      }),
    );
  }

  @Cron('*/1 * * * *')
  checkEvents() {
    this.eventRepository.getPublishableEvents().then((events) => {
      events.forEach((event) => {
        this.publishMessages(event);
      });
    });
    this.eventRepository.getLockableEvents().then((events) => {
      events.forEach((event) => {
        this.eventRepository.update(event.id, { locked: true });
        this.updateEnrolmentMessage(event);
      });
    });
    this.eventRepository.getClosableEvents().then((events) => {
      events.forEach((event) => {
        this.eventRepository.update(event.id, { closed: true });
        this.updateEnrolmentMessage(event);
      });
    });
  }
}
