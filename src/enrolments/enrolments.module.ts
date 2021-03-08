import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrolmentsDiscordService } from './enrolments-discord.service';
import { EnrolmentsController } from './enrolments.controller';
import { EnrolmentsRepository } from './enrolments.repository';
import { EnrolmentsService } from './enrolments.service';

@Module({
  imports: [TypeOrmModule.forFeature([EnrolmentsRepository])],
  controllers: [EnrolmentsController],
  providers: [EnrolmentsService, EnrolmentsDiscordService],
  exports: [EnrolmentsDiscordService],
})
export class EnrolmentsModule {}
