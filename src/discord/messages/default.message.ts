import { MessageEmbed } from 'discord.js';
import { EmbedConfig } from '../../config/embeds.config';
import { HLLEvent } from '../../typeorm/entities';

export class DefaultMessage extends MessageEmbed {
  constructor(config: EmbedConfig, event?: HLLEvent) {
    super();
    this.setColor(config.color).setThumbnail(config.thumbnail).setTimestamp();
    if (event) this.setFooter(`#${event.id} - Erstellt von ${event.organisator.name}`);
  }
}
