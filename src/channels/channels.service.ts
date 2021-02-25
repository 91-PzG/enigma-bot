import { Injectable } from '@nestjs/common';
import { DiscordService } from '../discord/discord.service';
import { DiscordChannelDto } from './dtos/discord-channel.dto';

@Injectable()
export class ChannelService {
  constructor(private readonly discordService: DiscordService) {}

  getChannels(): DiscordChannelDto[] {
    return this.discordService.getEventChannels();
  }
}
