import { Param } from '@discord-nestjs/core';

export class AttendanceDto {
  @Param({
    name: 'eventid',
    description: 'Id of the event (can be found in the footer)',
    required: true,
  })
  eventId: string;
  @Param({
    name: 'serversocket',
    description: 'IP and Port of the gameserver (can be found on battlemetrics)',
    required: true,
  })
  socket: string;
}
