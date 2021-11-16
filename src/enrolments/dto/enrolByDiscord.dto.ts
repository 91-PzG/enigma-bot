import { Division, EnrolmentType, Member } from '../../typeorm/entities';

export class EnrolByDiscordDto {
  type: EnrolmentType;
  eventId: number;
  member: Member;
  division: Division;
  squadlead: boolean = false;
  commander: boolean = false;
}
