import { Connection, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { HLLWarfareMaps, Mappoll, Mappollvote } from '.';

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
export class MappollvotesView implements Record<HLLWarfareMaps, number> {
  @ViewColumn()
  @PrimaryColumn()
  id: number;

  @ViewColumn()
  eventId: number;

  @ViewColumn()
  CT: number;

  @ViewColumn()
  Foy: number;

  @ViewColumn()
  Hill400: number;

  @ViewColumn()
  Hurtgen: number;

  @ViewColumn()
  PHL: number;

  @ViewColumn()
  SME: number;

  @ViewColumn()
  StMarie: number;

  @ViewColumn()
  Utah: number;

  @ViewColumn()
  Kursk: number;

  @ViewColumn()
  Stalin: number;
}
