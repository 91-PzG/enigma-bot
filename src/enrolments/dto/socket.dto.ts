import { Division, Enrolment } from '../../typeorm/entities';

export interface CreateSquadDto {
  name: string;
  division: Division;
  position: number;
}

export interface RenameSquadDto {
  id: number;
  name: string;
  position: number;
  division: Division;
}

export interface DeleteSquadDto {
  id: number;
  position: number;
  division: Division;
}

export interface MoveSoldierDto {
  oldSoldier: Enrolment;
  newSoldier: Enrolment;
}
