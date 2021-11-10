import { Controller, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ParseSocketPipe } from '../util/parseSocket.pipe';

@Controller('discord')
export class BotController {
  //constructor(private attendanceCommand: AttendanceCommand) {}

  @Post('/attendance')
  setAttendance(
    @Query('eventId', ParseIntPipe) eventId: number,
    @Query('socket', ParseSocketPipe) socket: string,
  ): Promise<void> {
    return;
    //return this.attendanceCommand.attendanceCommand(eventId, socket);
  }
}
