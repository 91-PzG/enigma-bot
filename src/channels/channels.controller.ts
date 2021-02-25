import { Controller, Get } from '@nestjs/common';
import { ChannelService } from './channels.service';
import { DiscordChannelDto } from './dtos/discord-channel.dto';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('/')
  getChannels(): DiscordChannelDto[] {
    return this.channelService.getChannels();
  }
}
