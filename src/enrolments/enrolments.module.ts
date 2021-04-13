import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrolment, HLLEvent, Squad } from '../postgres/entities';
import { EnrolmentsDiscordService } from './enrolments-discord.service';
import { EnrolmentsController } from './enrolments.controller';
import { EnrolmentsService } from './enrolments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enrolment, HLLEvent, Squad])],
  controllers: [EnrolmentsController],
  providers: [EnrolmentsService, EnrolmentsDiscordService],
  exports: [EnrolmentsDiscordService],
})
export class EnrolmentsModule {}
