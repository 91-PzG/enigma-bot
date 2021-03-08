import { Division, EnrolmentType, HLLRole } from '../../postgres/entities';

export class EnrolmentEventDto {
  name: string;
  date: Date;
}

export class EnrolmentDto {
  squadlead: boolean;
  commander: boolean;
  timestamp: Date;
  event: EnrolmentEventDto;
  division: Division;
  enrolmentType: EnrolmentType;
  squad: string;
  role: HLLRole;
}
