import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrolmentsModule } from '../enrolments/enrolments.module';
import { UsersModule } from '../users/users.module';
import { HLLDiscordEventRepository } from './discord/hlldiscordevent.repository';
import { HLLEventsDiscordService } from './discord/hllevent-discord.service';
import { MessageModule } from './discord/messages/message.module';
import { MissedEventsModule } from './discord/missedEvents/missedEvents.module';
import { RegistrationModule } from './discord/registration/registration.module';
import { ReminderModule } from './discord/reminder/reminder.module';
import { HLLEventController } from './hllevent.controller';
import { HLLEventRepository } from './hllevent.repository';
import { HLLEventService } from './hllevent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HLLEventRepository, HLLDiscordEventRepository]),
    UsersModule,
    MessageModule,
    EnrolmentsModule,
    RegistrationModule,
    ReminderModule,
    MissedEventsModule,
  ],
  controllers: [HLLEventController],
  providers: [HLLEventService, HLLEventsDiscordService],
  exports: [HLLEventsDiscordService],
})
export class HLLEventModule {}
