import { Enrolment } from '../../typeorm/entities';

export class RosterDto {
  eventname: string;
  commander: Enrolment | null;
  pool: Enrolment[] = [];
  squads: SquadDto[] = [];

  constructor(eventname: string) {
    this.eventname = eventname;
  }
}

export class SquadDto {
  id: number;
  name: string;
  position: number;
  members?: Enrolment[] = [];
}
