import { forwardRef, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule } from '../discord/discord.module';
import { Enrolment, HLLEvent, Member } from '../typeorm/entities';
import { BotController } from './bot.controller';
import { GuildMemberUpdate } from './events/guildmemberupdate.event';
import { ServerService } from './server-service/server.service';

const EVENTS: Provider[] = [GuildMemberUpdate];

@Module({
  imports: [
    forwardRef(() => DiscordModule),
    TypeOrmModule.forFeature([Member, HLLEvent, Enrolment]),
  ],
  providers: [ServerService, ...EVENTS],
  controllers: [BotController],
  exports: [TypeOrmModule.forFeature([Member, HLLEvent, Enrolment])],
})
export class BotModule {}
