import { DiscordGuard } from '@discord-nestjs/core';
import { Message } from 'discord.js';

export class MaprecorderGuard implements DiscordGuard {
  canActive(event: 'messageCreate', [message]: [Message]): boolean {
    return message.content.startsWith('[Server ');
  }
}
