import { MessageEmbed } from 'discord.js';
import { EmbedConfig } from '../../../config/embeds.config';
import { HLLEvent } from '../../../postgres/entities';

export class DefaultMessage extends MessageEmbed {
  constructor(event: HLLEvent, config: EmbedConfig) {
    super();
    this.setColor(config.color)
      .setThumbnail(config.thumbnail)
      .setTimestamp()
      .setFooter(`#${event.id} - Erstellt von ${event.organisator.name}`);
  }
}
