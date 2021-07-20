import { Controller, ParseIntPipe, Post, Query } from '@nestjs/common';
import { parseSocketPipe } from '../util/parseSocket.pipe';
import { AttendanceCommand } from './commands/attendance.command';
import { MixedRosterDto, RosterDto } from './dto/roster.dto';

@Controller('discord')
export class EnrolmentsController {
  constructor(private attendanceCommand: AttendanceCommand) {}

  @Post('/attendance')
  getEnrolmentForEvent(
    @Query('eventId', ParseIntPipe) eventId: number,
    @Query('socket', parseSocketPipe) socket: string,
  ): Promise<RosterDto | MixedRosterDto> {
    return this.attendanceCommand.attendanceCommand(eventId, socket);
  }
}
