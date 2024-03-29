import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrolmentsModule } from '../enrolments/enrolments.module';
import { Enrolment, Member } from '../typeorm/entities';
import { UsersModule } from '../users/users.module';
import { HLLDiscordEventRepository } from './discord/hlldiscordevent.repository';
import { HLLEventsDiscordService } from './discord/hllevent-discord.service';
import { RegistrationService } from './discord/registration.service';
import { ReminderService } from './discord/reminder.service';
import { HLLEventController } from './hllevent.controller';
import { HLLEventRepository } from './hllevent.repository';
import { HLLEventService } from './hllevent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HLLEventRepository, HLLDiscordEventRepository, Enrolment, Member]),
    UsersModule,
    EnrolmentsModule,
  ],
  controllers: [HLLEventController],
  providers: [HLLEventService, HLLEventsDiscordService, ReminderService, RegistrationService],
  exports: [HLLEventsDiscordService],
})
export class HLLEventModule {}
