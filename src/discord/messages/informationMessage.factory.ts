import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageEmbed } from 'discord.js';
import { EmbedConfig } from '../../config/embeds.config';
import { HLLEvent } from '../../typeorm/entities';
import { InformationMessage } from './information.message';

@Injectable()
export class InformationMessageFactory {
  private embedConfig: EmbedConfig;

  constructor(config: ConfigService) {
    this.embedConfig = config.get('embed') as EmbedConfig;
  }

  public createMessage(event: HLLEvent): MessageEmbed {
    return new InformationMessage(event, this.embedConfig);
  }
}
