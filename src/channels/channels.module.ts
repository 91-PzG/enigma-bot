import { Module } from '@nestjs/common';
import { DiscordModule } from '../discord/discord.module';
import { ChannelsController } from './channels.controller';
import { ChannelService } from './channels.service';

@Module({
  imports: [DiscordModule],
  controllers: [ChannelsController],
  providers: [ChannelService],
})
export class ChannelsModule {}
