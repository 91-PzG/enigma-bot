import { Connection, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { HLLWarfareMaps, Mappoll, Mappollvote } from '../entities';

@ViewEntity({
  expression: (connection: Connection) => {
    const qb = connection
      .createQueryBuilder()
      .select('mp.eventId', 'eventId')
      .addSelect('mp.id', 'id')
      .from(Mappollvote, 'mpv')
      .leftJoin(Mappoll, 'mp', 'mpv.pollId = mp.id')
      .groupBy('mp.id');
    Object.values(HLLWarfareMaps).forEach((map: string) => {
      qb.addSelect(`count(case when mpv.map = '${map}' then 1 end)`, map);
    });
    return qb;
  },
})
export class MappollvotesView implements Record<HLLWarfareMaps, string> {
  @ViewColumn()
  @PrimaryColumn()
  id: number;

  @ViewColumn()
  eventId: number;

  @ViewColumn()
  CT: string;

  @ViewColumn()
  Foy: string;

  @ViewColumn()
  Hill400: string;

  @ViewColumn()
  Hurtgen: string;

  @ViewColumn()
  PHL: string;

  @ViewColumn()
  SME: string;

  @ViewColumn()
  StMarie: string;

  @ViewColumn()
  Utah: string;

  @ViewColumn()
  Kursk: string;

  @ViewColumn()
  Stalin: string;
}
