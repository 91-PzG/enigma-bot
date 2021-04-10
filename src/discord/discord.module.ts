import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateUsersCommand } from './commands/updateusers.command';
import { DiscordService } from './discord.service';
import { GuildMemberUpdate } from './events/guildmemberupdate.event';
import { DiscordUtil } from './util/discord.util';
import { MemberRepository } from './util/member.repository';

const COMMANDS: Provider[] = [UpdateUsersCommand];

const EVENTS: Provider[] = [GuildMemberUpdate];

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([MemberRepository])],
  providers: [DiscordService, DiscordUtil, ...COMMANDS, ...EVENTS],
  exports: [DiscordService],
})
export class DiscordModule {}
