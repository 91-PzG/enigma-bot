import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GuildEmoji, MessageEmbed } from 'discord.js';
import { EmbedConfig } from '../../../config/embeds.config';
import { DiscordService } from '../../../discord/discord.service';
import { EnrolmentsDiscordService } from '../../../enrolments/enrolments-discord.service';
import { HLLEvent } from '../../../postgres/entities';
import { EnrolmentMessage } from './enrolment.message';

export interface EmojiWrapper {
  squadlead: GuildEmoji | string;
  commander: GuildEmoji | string;
}

@Injectable()
export class EnrolmentMessageFactory {
  private config: EmbedConfig;
  private emojis: EmojiWrapper;

  constructor(
    config: ConfigService,
    private discordService: DiscordService,
    private enrolmentService: EnrolmentsDiscordService,
  ) {
    this.config = config.get('embed');
  }

  public async createMessage(event: HLLEvent): Promise<MessageEmbed> {
    if (!this.emojis) this.loadEmojis();
    const enrolments = await this.enrolmentService.getEnrolments(event.id);
    return new EnrolmentMessage(event, this.emojis, enrolments, this.config);
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
