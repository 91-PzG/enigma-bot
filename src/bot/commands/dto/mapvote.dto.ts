import { Param } from '@discord-nestjs/core';

export class MappollDto {
  @Param({
    name: 'eventid',
    description: 'Id of the event (can be found in the footer)',
    required: false,
  })
  eventId: string;
}
