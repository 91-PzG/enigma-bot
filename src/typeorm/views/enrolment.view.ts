import { Connection, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { Enrolment, EnrolmentType, HLLRole } from '../entities';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('e.id', 'id')
      .addSelect('e.squadlead', 'squadlead')
      .addSelect('e.commander', 'commander')
      .addSelect('e.position', 'position')
      .addSelect('e.username', 'name')
      .addSelect('e.eventId', 'eventId')
      .addSelect('e.memberId', 'memberId')
      .addSelect('e.enrolmentType', 'enrolmentType')
      .addSelect('e.squadId', 'squadId')
      .addSelect('e.role', 'role')
      .addSelect('e.isPresent', 'isPresent')
      .from(Enrolment, 'e')
      .orderBy('e.timestamp', 'ASC')
      .where("not e.enrolmentType = 'AB'"),
})
export class EnrolmentView {
  @ViewColumn()
  @PrimaryColumn()
  id: number;

  @ViewColumn()
  squadlead: boolean;

  @ViewColumn()
  commander: boolean;

  @ViewColumn()
  position: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  enrolmentType: EnrolmentType;

  @ViewColumn()
  squadId: number;

  @ViewColumn()
  role: HLLRole;

  @ViewColumn()
  isPresent: boolean;

  @ViewColumn()
  memberId: string;

  @ViewColumn()
  eventId: number;
}
