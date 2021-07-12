import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule } from '../../../discord/discord.module';
import { Enrolment, Member } from '../../../postgres/entities';
import { MissedEventsService } from './missedEvents.service';

@Module({
  imports: [DiscordModule, TypeOrmModule.forFeature([Enrolment, Member])],
  providers: [MissedEventsService],
  exports: [MissedEventsService],
})
export class MissedEventsModule {}
