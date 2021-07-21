import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact, Enrolment, HLLEvent, Member } from '../postgres/entities';
import { AttendanceCommand } from './commands/attendance.command';
import { UpdateUsersCommand } from './commands/updateusers.command';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { GuildMemberUpdate } from './events/guildmemberupdate.event';
import { DiscordUtil } from './util/discord.util';
import { ServerService } from './util/server.service';

const COMMANDS: Provider[] = [UpdateUsersCommand, AttendanceCommand];

const EVENTS: Provider[] = [GuildMemberUpdate];

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Member, Contact, HLLEvent, Enrolment])],
  controllers: [DiscordController],
  providers: [DiscordService, DiscordUtil, ServerService, ...COMMANDS, ...EVENTS],
  exports: [DiscordService],
})
export class DiscordModule {}
