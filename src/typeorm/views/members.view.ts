import { Connection, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { AccessRoles, Contact, Division, Member, Rank } from '../entities';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('m.id', 'id')
      .addSelect('m.division', 'division')
      .addSelect('m.rank', 'rank')
      .addSelect('m.memberSince', 'memberSince')
      .addSelect('m.recruitSince', 'recruitSince')
      .addSelect('m.roles', 'roles')
      .addSelect('c.name', 'name')
      .addSelect('c.comment', 'comment')
      .from(Member, 'm')
      .leftJoin(Contact, 'c', 'm.contactId = c.id'),
})
export class MembersView {
  @ViewColumn()
  @PrimaryColumn()
  id: number;

  @ViewColumn()
  division: Division;

  @ViewColumn()
  rank: Rank;

  @ViewColumn()
  memberSince: Date;

  @ViewColumn()
  recruitSince: Date;

  @ViewColumn()
  roles: AccessRoles[];

  @ViewColumn()
  name: string;

  @ViewColumn()
  comment: string;
}
