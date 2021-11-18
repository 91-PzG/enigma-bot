import { forwardRef, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule } from '../discord/discord.module';
import { Enrolment, HLLEvent, Mappoll, Mappollvote, Member } from '../typeorm/entities';
import { BotController } from './bot.controller';
import { GuildMemberUpdate } from './events/guildmemberupdate.event';
import { AttendanceService } from './services/attendance.service';
import { MappollService } from './services/mappoll.service';
import { ServerService } from './services/server.service';

const EVENTS: Provider[] = [GuildMemberUpdate];

@Module({
  imports: [
    forwardRef(() => DiscordModule),
    TypeOrmModule.forFeature([Member, HLLEvent, Enrolment, Mappoll, Mappollvote]),
  ],
  providers: [ServerService, MappollService, AttendanceService, ...EVENTS],
  controllers: [BotController],
  exports: [AttendanceService, MappollService, TypeOrmModule.forFeature([HLLEvent, Member])],
})
export class BotModule {}
