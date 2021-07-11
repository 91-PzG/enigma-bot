import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from 'discord.js';
import { RegistrationConfig } from '../../../config/registration.config';
import { DiscordService } from '../../../discord/discord.service';
import { EnrolmentsDiscordService } from '../../../enrolments/enrolments-discord.service';
import { HLLEvent } from '../../../postgres/entities';
import { UsersService } from '../../../users/users.service';
import { HLLEventsDiscordService } from '../hllevent-discord.service';
import { RegistrationDialog } from './registration.dialog';
import { RegistrationService } from './registration.service';

@Injectable()
export class RegistrationManager {
  private collectors: { [key: number]: RegistrationService } = {};
  public config: RegistrationConfig;
  public hllEventDiscordService: HLLEventsDiscordService;

  constructor(
    configService: ConfigService,
    public enrolmentService: EnrolmentsDiscordService,
    public discordService: DiscordService,
    public usersService: UsersService,
    public dialog: RegistrationDialog,
  ) {
    this.config = configService.get('registration');
  }

  async addEvent(event: HLLEvent, service: HLLEventsDiscordService) {
    if (!this.hllEventDiscordService) this.hllEventDiscordService = service;
    if (!event.discordEvent) return;

    const message = await this.discordService.getMessageById(
      event.discordEvent.enrolmentMsg,
      event.discordEvent.channelId,
      true,
    );

    if (!message) {
      event.closed = true;
      event.save();
      return;
    }

    this.addReactions(message, event.locked);

    this.collectors[event.id] = new RegistrationService(event, message, this);
  }

  editEvent(event: HLLEvent) {
    if (!this.collectors[event.id]) return;

    if (this.collectors[event.id].event.locked != event.locked) {
      this.addReactions(this.collectors[event.id].message, event.locked);
    }
    this.collectors[event.id].event = event;
  }

  async closeEvent(eventId: number) {
    if (!this.collectors[eventId]) return;
    await this.collectors[eventId].stopCollector();
    await this.collectors[eventId].message.reactions.removeAll();
    this.collectors[eventId].message.react('🛑');
    delete this.collectors[eventId];
  }

  private async addReactions(message: Message, locked: boolean) {
    await message.reactions.removeAll();

    if (locked) await message.react(this.config.reactions.locked);
    else await message.react(this.config.reactions.AN);
    await message.react(this.config.reactions.RE);
    await message.react(this.config.reactions.AB);
  }
}
