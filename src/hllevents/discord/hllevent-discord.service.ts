import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ButtonInteraction, Message, MessageActionRow, MessageButton } from 'discord.js';
import { DiscordService } from '../../discord/discord.service';
import { HLLEvent } from '../../typeorm/entities';
import { HLLEventRepository } from '../hllevent.repository';
import { HLLDiscordEventRepository } from './hlldiscordevent.repository';
import { EnrolmentMessageFactory } from './messages/enrolmentMessage.factory';
import { InformationMessageFactory } from './messages/informationMessage.factory';

@Injectable()
export class HLLEventsDiscordService {
  logger = new Logger('HLLEventsDiscordService');

  constructor(
    private discordService: DiscordService,
    private discordRepository: HLLDiscordEventRepository,
    private eventRepository: HLLEventRepository,
    private informationMessageFactory: InformationMessageFactory,
    private enrolmentMessageFactory: EnrolmentMessageFactory,
    private configService: ConfigService,
  ) {}

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

    event.discordEvent = await this.discordRepository.createEntity(
      channel.id,
      informationId,
      enrolmentId,
    );

    event.autoPublishDate = null;
    //event.save();
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

  async updateEnrolmentMessage(event: HLLEvent, interaction?: ButtonInteraction): Promise<any> {
    const discordEvent = await this.discordRepository.findOne(event.discordEventId);
    if (!discordEvent) {
      this.logger.debug(`Encountered error fetching discordevent with id ${event.discordEventId}`);
      throw new Error('Discord Event not found');
    }

    const embed = await this.enrolmentMessageFactory.createMessage(event);
    const newMessage = {
      embeds: [embed],
      components: [this.createMessageActionRow(event.id, event.locked, event.closed)],
    };
    if (interaction) return (interaction.message as Message).edit(newMessage);

    const oldMessage = await this.getMessageFromDiscord(
      event.id,
      discordEvent.channelId,
      discordEvent.enrolmentMsg,
    );
    oldMessage.edit(newMessage);
  }

  private async getMessageFromDiscord(
    eventId: number,
    channel: string,
    message: string,
  ): Promise<Message | undefined> {
    try {
      return await this.discordService.getMessageById(message, channel, true);
    } catch (error) {
      this.eventRepository.update(eventId, { closed: true });
    }
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
        this.updateEnrolmentMessage(event);
      });
    });
    this.eventRepository.getClosableEvents().then((events) => {
      events.forEach((event) => {
        event.closed = true;
        event.save();
        this.updateEnrolmentMessage(event);
      });
    });
  }
}
