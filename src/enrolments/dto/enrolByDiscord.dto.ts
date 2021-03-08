import { Division, EnrolmentType } from '../../postgres/entities';

export class EnrolByDiscordDto {
  type: EnrolmentType;
  eventId: number;
  memberId: string;
  division: Division;
  squadlead: boolean = false;
  commander: boolean = false;
}
