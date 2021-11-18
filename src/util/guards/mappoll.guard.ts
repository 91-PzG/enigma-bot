import { DiscordGuard } from '@discord-nestjs/core';
import { ButtonInteraction } from 'discord.js';

export class MappollGuard implements DiscordGuard {
  canActive(event: 'interactionCreate', [interaction]: [ButtonInteraction]): boolean {
    return interaction.customId.startsWith('poll');
  }
}
