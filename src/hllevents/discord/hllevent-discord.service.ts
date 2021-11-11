import { On, UseGuards } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ButtonInteraction, Message, MessageActionRow, MessageButton } from 'discord.js';
import { DiscordService } from '../../discord/discord.service';
import { EnrolByDiscordDto } from '../../enrolments/dto/enrolByDiscord.dto';
import { EnrolmentsDiscordService } from '../../enrolments/enrolments-discord.service';
import { EnrolmentType, HLLEvent } from '../../typeorm/entities';
import { UsersService } from '../../users/users.service';
import { ButtonGuard } from '../../util/guards/button.guard';
import { RegistrationGuard } from '../../util/guards/registration.guard';
import { HLLEventRepository } from '../hllevent.repository';
import { HLLDiscordEventRepository } from './hlldiscordevent.repository';
import { EnrolmentMessageFactory } from './messages/enrolmentMessage.factory';
import { InformationMessageFactory } from './messages/informationMessage.factory';
import { ReminderService } from './reminder/reminder.service';

@Injectable()
export class HLLEventsDiscordService {
  logger = new Logger('HLLEventsDiscordService');

  constructor(
    private discordService: DiscordService,
    private discordRepository: HLLDiscordEventRepository,
    private eventRepository: HLLEventRepository,
    private informationMessageFactory: InformationMessageFactory,
    private enrolmentMessageFactory: EnrolmentMessageFactory,
    private reminderService: ReminderService,
    private enrolmentsService: EnrolmentsDiscordService,
    private usersService: UsersService,
  ) {}

  @On('interactionCreate')
  @UseGuards(ButtonGuard, RegistrationGuard)
  async register(interaction: ButtonInteraction) {
    const event = await this.validateEvent(interaction);
    if (!event) return;

    const dto = await this.createEnrolmentDto(interaction);
    if (!dto) return;

    this.enrolmentsService
      .enrol(dto)
      .then(() => {
        this.updateEnrolmentMessage(event)
          .then(() => this.sendSuccess(interaction, dto))
          .catch(() => this.sendError(interaction, 'Fehler beim update der Nachricht.'));
      })
      .catch(() => this.sendError(interaction, 'Fehler bei der Anmeldung.'));
  }

  private sendSuccess(interaction: ButtonInteraction, dto: EnrolByDiscordDto) {
    const roleString = dto.commander ? ' als Kommandant ' : dto.squadlead ? ' als Squadlead ' : ' ';
    interaction.reply({
      content: `Du hast dich erfolgreich${roleString}${
        dto.type === EnrolmentType.ANMELDUNG ? 'an' : 'ab'
      }gemeldet!`,
      ephemeral: true,
    });
  }

  private sendError(interaction: ButtonInteraction, message: string) {
    interaction.reply({
      content: message + ' Bitte versuche es später erneut',
      ephemeral: true,
    });
  }

  private async createEnrolmentDto(interaction: ButtonInteraction): Promise<EnrolByDiscordDto> {
    const { customId } = interaction;
    const member = await this.usersService.getActiveMember(interaction.user.id);
    const type: EnrolmentType = customId.includes('cancel')
      ? EnrolmentType.ABMELDUNG
      : EnrolmentType.ANMELDUNG;
    const eventId = parseInt(customId.split('-')[0], 10);

    return {
      type,
      eventId,
      member,
      division: member.division,
      squadlead: customId.includes('squadlead'),
      commander: customId.includes('commander'),
    };
  }

  private async validateEvent(interaction: ButtonInteraction): Promise<HLLEvent> {
    const eventId = parseInt(interaction.customId.split('-')[0], 10);
    const event = await this.eventRepository.getEventById(eventId);
    if (!event || event.closed || (event.locked && !interaction.customId.includes('cancel'))) {
      interaction.reply({
        content: `Du kannst dich bei Event #${eventId} nicht mehr anmelden`,
        ephemeral: true,
      });
      return null;
    }
    return event;
  }

  async publishMessages(event: HLLEvent) {
    const channel = await this.discordService.createEventChannelIfNotExists(event.channelName);

    const informationMessage = this.informationMessageFactory.createMessage(event);
    const enrolmentMessage = await this.enrolmentMessageFactory.createMessage(event);

    const informationId = (await channel.send({ embeds: [informationMessage] })).id;
    const enrolmentId = (
      await channel.send({
        embeds: [enrolmentMessage],
        components: [this.createMessageActionRow(event.id)],
      })
    ).id;

    event.discordEvent = await this.discordRepository.createEntity(
      channel.id,
      informationId,
      enrolmentId,
    );

    event.autoPublishDate = null;
    event.save();
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

  async updateEnrolmentMessage(event: HLLEvent): Promise<any> {
    const discordEvent = await this.discordRepository.findOne(event.discordEventId);
    if (!discordEvent) {
      this.logger.debug(`Encountered error fetching discordevent with id ${event.discordEventId}`);
      throw new Error('Discord Event not found');
    }

    if (typeof event.organisator != 'string') {
      //@ts-ignore
      event.organisator = event.organisator?.name || 'error';
    }

    let oldMessage = await this.getMessageFromDiscord(
      event.id,
      discordEvent.channelId,
      discordEvent.enrolmentMsg,
    );
    if (!oldMessage) {
      this.logger.debug(`Encountered error fetching message for event ${event.discordEventId}`);
      throw new Error('Error fetching messages');
    }

    const newMessage = await this.enrolmentMessageFactory.createMessage(event);
    return oldMessage.edit({ embeds: [newMessage] });
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

  private createMessageActionRow(eventId: number): MessageActionRow {
    return new MessageActionRow().addComponents(
      new MessageButton({
        customId: `${eventId}-register`,
        style: 'SUCCESS',
        label: 'Anmelden',
      }),
      new MessageButton({
        customId: `${eventId}-squadlead-register`,
        style: 'PRIMARY',
        label: 'Squadlead',
      }),
      new MessageButton({
        customId: `${eventId}-commander-register`,
        style: 'SECONDARY',
        label: 'Kommandant',
      }),
      new MessageButton({
        customId: `${eventId}-cancel-register`,
        style: 'DANGER',
        label: 'Abmelden',
      }),
    );
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
      });
    });
    this.eventRepository.getClosableEvents().then((events) => {
      events.forEach((event) => {
        event.closed = true;
        event.save();
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
