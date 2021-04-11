import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../postgres/entities';
import { UpdateUsersCommand } from './commands/updateusers.command';
import { DiscordService } from './discord.service';
import { GuildMemberUpdate } from './events/guildmemberupdate.event';
import { DiscordUtil } from './util/discord.util';
import { ServerService } from './util/server.service';

const COMMANDS: Provider[] = [UpdateUsersCommand];

const EVENTS: Provider[] = [GuildMemberUpdate];

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Member])],
  providers: [DiscordService, DiscordUtil, ServerService, ...COMMANDS, ...EVENTS],
  exports: [DiscordService],
})
export class DiscordModule {}
