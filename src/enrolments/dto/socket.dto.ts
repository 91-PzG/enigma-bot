import { Enrolment } from '../../typeorm/entities';

export interface CreateSquadDto {
  name: string;
  position: number;
}

export interface RenameSquadDto {
  id: number;
  name: string;
  position: number;
}

export interface DeleteSquadDto {
  id: number;
  position: number;
}

export interface MoveSoldierDto {
  oldSoldier: Enrolment;
  newSoldier: Enrolment;
}
