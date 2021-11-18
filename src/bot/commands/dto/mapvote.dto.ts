import { Param } from '@discord-nestjs/core';

export class AttendanceDto {
  @Param({
    name: 'eventid',
    description: 'Id of the event (can be found in the footer)',
    required: false,
  })
  eventId: string;
}
