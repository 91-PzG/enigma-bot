import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule } from '../../../discord/discord.module';
import { Enrolment, Member } from '../../../postgres/entities';
import { ReminderService } from './reminder.service';

@Module({
  imports: [DiscordModule, TypeOrmModule.forFeature([Enrolment, Member])],
  providers: [ReminderService],
  exports: [ReminderService],
})
export class ReminderModule {}
