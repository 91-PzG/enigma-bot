import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageEmbed } from 'discord.js';
import { EmbedConfig } from '../../../config/embeds.config';
import { DiscordService } from '../../../discord/discord.service';
import { RosterDto } from '../../../enrolments/dto/roster.dto';
import { EnrolmentsService } from '../../../enrolments/enrolments.service';
import { HLLEvent } from '../../../postgres/entities';
import { EmojiWrapper } from './enrolmentMessage.factory';
import { RosterMessage } from './roster.message';

@Injectable()
export class RosterMessageFactory {
  private config: EmbedConfig;
  private emojis: EmojiWrapper;

  constructor(
    config: ConfigService,
    private discordService: DiscordService,
    private enrolmentsService: EnrolmentsService,
  ) {
    this.config = config.get('embed');
  }

  public async createMessage(event: HLLEvent): Promise<MessageEmbed> {
    if (!this.emojis) this.loadEmojis();
    return new RosterMessage(
      (await this.enrolmentsService.getEnrolmentsForEvent(event.id)) as RosterDto,
      event,
      this.emojis,
      this.config,
    );
  }

  private loadEmojis() {
    this.emojis = {
      squadlead: this.config.squadleadEmoji
        ? this.discordService.getEmojiById(this.config.squadleadEmoji)
        : '💂',
      commander: this.config.commanderEmoji
        ? this.discordService.getEmojiById(this.config.commanderEmoji)
        : '🤠',
    };
  }
}
