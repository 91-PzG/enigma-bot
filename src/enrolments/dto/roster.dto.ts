import { Enrolment } from '../../postgres/entities';

export class RosterDto {
  eventname: string;
  commander: Enrolment | null;
  infanterie: DivisionDto;
  armor: DivisionDto;
  recon: DivisionDto;
  artillery: DivisionDto;
}

export class MixedRosterDto {
  eventname: string;
  enrolments: DivisionDto;
}

export interface DivisionDto {
  pool: Enrolment[];
  reserve: Enrolment[];
  squads: SquadDto[];
}

export interface SquadDto {
  id: number;
  name: string;
  position: number;
  division: string;
  members?: Enrolment[];
}
