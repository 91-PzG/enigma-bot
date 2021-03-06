import { Controller, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ParseSocketPipe } from '../util/parseSocket.pipe';
import { AttendanceCommand } from './commands/attendance.command';

@Controller('discord')
export class DiscordController {
  constructor(private attendanceCommand: AttendanceCommand) {}

  @Post('/attendance')
  setAttendance(
    @Query('eventId', ParseIntPipe) eventId: number,
    @Query('socket', ParseSocketPipe) socket: string,
  ): Promise<void> {
    return this.attendanceCommand.attendanceCommand(eventId, socket);
  }
}
