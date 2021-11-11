import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrolmentsModule } from '../enrolments/enrolments.module';
import { Enrolment, Member } from '../typeorm/entities';
import { UsersModule } from '../users/users.module';
import { HLLDiscordEventRepository } from './discord/hlldiscordevent.repository';
import { HLLEventsDiscordService } from './discord/hllevent-discord.service';
import { MessageModule } from './discord/messages/message.module';
import { ReminderService } from './discord/reminder.service';
import { HLLEventController } from './hllevent.controller';
import { HLLEventRepository } from './hllevent.repository';
import { HLLEventService } from './hllevent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HLLEventRepository, HLLDiscordEventRepository, Enrolment, Member]),
    UsersModule,
    MessageModule,
    EnrolmentsModule,
  ],
  controllers: [HLLEventController],
  providers: [HLLEventService, HLLEventsDiscordService, ReminderService],
  exports: [HLLEventsDiscordService],
})
export class HLLEventModule {}
