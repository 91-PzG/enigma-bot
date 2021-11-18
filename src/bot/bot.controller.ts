import { Controller, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ParseSocketPipe } from '../util/parseSocket.pipe';
import { AttendanceService } from './services/attendance.service';

@Controller('discord')
export class BotController {
  constructor(private service: AttendanceService) {}

  @Post('/attendance')
  setAttendance(
    @Query('eventId', ParseIntPipe) eventId: number,
    @Query('socket', ParseSocketPipe) socket: string,
  ): Promise<void> {
    return this.service.attendanceCommand(eventId, socket);
  }
}
