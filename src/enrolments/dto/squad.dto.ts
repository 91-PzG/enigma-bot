import { Squad } from '../../typeorm/entities';
import { EnrolmentDto } from './enrolment.dto';

export interface SquadDto extends Squad {
  members?: EnrolmentDto[];
}
