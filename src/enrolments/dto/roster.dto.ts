import { Enrolment } from '../../postgres/entities';

export class RosterDto {
  eventname: string;
  commander: Enrolment | null;
  infanterie: DivisionDto = new DivisionDto();
  armor: DivisionDto = new DivisionDto();
  recon: DivisionDto = new DivisionDto();
  artillery: DivisionDto = new DivisionDto();

  constructor(eventname: string) {
    this.eventname = eventname;
  }
}

export class MixedRosterDto {
  eventname: string;
  enrolments: DivisionDto;
  constructor(eventname: string) {
    this.eventname = eventname;
  }
}

export class DivisionDto {
  pool: Enrolment[] = [];
  reserve: Enrolment[] = [];
  squads: SquadDto[] = [];
}

export class SquadDto {
  id: number;
  name: string;
  position: number;
  division: string;
  members?: Enrolment[] = [];
}
