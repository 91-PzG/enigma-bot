import { DiscordGuard } from '@discord-nestjs/core';
import { Interaction } from 'discord.js';

export class ButtonGuard implements DiscordGuard {
  canActive(event: 'interactionCreate', [interaction]: [Interaction]): boolean {
    return interaction.isButton();
  }
}
