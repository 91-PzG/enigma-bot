import { EnrolmentType, Member } from '../../typeorm/entities';

export class EnrolByDiscordDto {
  type: EnrolmentType;
  eventId: number;
  member: Member;
  squadlead: boolean = false;
  commander: boolean = false;
}
