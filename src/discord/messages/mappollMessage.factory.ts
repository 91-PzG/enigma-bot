import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { MessageEmbed } from 'discord.js';
import { EntityManager } from 'typeorm';
import { EmbedConfig } from '../../config/embeds.config';
import { Mappoll } from '../../typeorm/entities';
import { MappollvotesView } from '../../typeorm/entities/mapvotes.view';
import { MappollMessage } from './mappoll.message';

@Injectable()
export class MappollMessageFactory {
  private embedConfig: EmbedConfig;

  constructor(@InjectEntityManager() private entityManager: EntityManager, config: ConfigService) {
    this.embedConfig = config.get('embed');
  }

  public async createMessage(poll: Mappoll): Promise<MessageEmbed> {
    const mapVotes = await this.getVotes(poll.id);
    return new MappollMessage(this.embedConfig, poll, mapVotes);
  }

  private getVotes(id: number) {
    return this.entityManager.findOne(MappollvotesView, { id });
  }
}
