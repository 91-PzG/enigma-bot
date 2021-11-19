import { EnrolmentDto } from './enrolment.dto';

export class RosterDto {
  eventname: string;
  commander: EnrolmentDto | null;
  pool: EnrolmentDto[] = [];
  squads: SquadDto[] = [];

  constructor(eventname: string) {
    this.eventname = eventname;
  }
}

export class SquadDto {
  id: number;
  name: string;
  position: number;
  members?: EnrolmentDto[] = [];
}
