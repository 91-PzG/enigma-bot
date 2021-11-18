import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { GuildEmoji, MessageEmbed } from 'discord.js';
import { Repository } from 'typeorm';
import { EmbedConfig } from '../../config/embeds.config';
import { EnrolmentsDiscordService } from '../../enrolments/enrolments-discord.service';
import { HLLEvent, Squad } from '../../typeorm/entities';
import { DiscordService } from '../discord.service';
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
    @InjectRepository(Squad)
    private squadRepository: Repository<Squad>,
  ) {
    this.config = config.get('embed');
  }

  public async createMessage(event: HLLEvent): Promise<MessageEmbed> {
    if (!this.emojis) await this.loadEmojis();
    const enrolments = await this.enrolmentService.getEnrolments(event.id);
    const squads = await this.getSquads(event.id);
    return new EnrolmentMessage(event, this.emojis, enrolments, squads, this.config);
  }

  private async getSquads(eventId: number): Promise<Squad[]> {
    return this.squadRepository
      .createQueryBuilder()
      .select(['name', 'id', 'position', 'division'])
      .where('"eventId" = :eventId', { eventId })
      .orderBy('division', 'ASC')
      .addOrderBy('position', 'ASC')
      .getRawMany();
  }

  private async loadEmojis() {
    this.emojis = {
      squadlead: /[\d]+/.test(this.config.squadleadEmoji)
        ? await this.discordService.getEmojiById(this.config.squadleadEmoji)
        : this.config.squadleadEmoji,
      commander: /[\d]+/.test(this.config.commanderEmoji)
        ? await this.discordService.getEmojiById(this.config.commanderEmoji)
        : this.config.commanderEmoji,
    };
  }
}
