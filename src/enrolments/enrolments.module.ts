import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrolment, HLLEvent, Squad } from '../typeorm/entities';
import { EnrolmentsGateway } from './enrolment.gateway';
import { EnrolmentsDiscordService } from './enrolments-discord.service';
import { EnrolmentsController } from './enrolments.controller';
import { EnrolmentsService } from './enrolments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enrolment, HLLEvent, Squad])],
  controllers: [EnrolmentsController],
  providers: [EnrolmentsGateway, EnrolmentsService, EnrolmentsDiscordService],
  exports: [EnrolmentsDiscordService, EnrolmentsService],
})
export class EnrolmentsModule {}
