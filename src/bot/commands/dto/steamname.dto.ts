import { Param } from '@discord-nestjs/core';

export class SteamnameDto {
  @Param({
    name: 'name',
    description: 'Dein Steam-Nutzername',
    required: false,
  })
  name: string;
}
