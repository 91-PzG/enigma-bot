import { DiscordGuard } from '@discord-nestjs/core';
import { ButtonInteraction } from 'discord.js';

export class RegistrationGuard implements DiscordGuard {
  canActive(event: 'interactionCreate', [interaction]: [ButtonInteraction]): boolean {
    return interaction.customId.endsWith('register');
  }
}
