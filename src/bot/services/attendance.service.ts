import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { query, QueryResult } from 'gamedig';
import { Brackets, Repository } from 'typeorm';
import { Enrolment } from '../../typeorm/entities';

@Injectable()
export class AttendanceService {
  constructor(@InjectRepository(Enrolment) private enrolmentRepository: Repository<Enrolment>) {}

  async attendanceCommand(eventId: number, socket: string): Promise<any> {
    const queryResult = await this.queryServer(socket);
    if (!queryResult)
      throw new NotFoundException(`Der Server unter ${socket} kann nicht erreicht werden`);

    const updates: Promise<void>[] = [];

    queryResult.players.forEach((player) => {
      updates.push(this.setAttendance(player.name, eventId));
    });

    return Promise.all(updates);
  }

  private queryServer(socket: string): Promise<QueryResult> {
    const [host, port] = socket.split(':');
    return new Promise<QueryResult | null>((resolve) =>
      query({
        type: 'hll',
        host,
        port: parseInt(port, 10),
      })
        .then((result) => resolve(result))
        .catch(() => resolve(null)),
    );
  }

  private setAttendance(playerName: string, eventId: number) {
    if (!playerName) return;
    return new Promise<void>(async (resolve) => {
      await this.enrolmentRepository
        .createQueryBuilder()
        .update()
        .set({ isPresent: true })
        .where(
          new Brackets((qb) => {
            qb.where('username LIKE :name', { name: playerName + '%' }).orWhere(
              'memberId = (SELECT m.id FROM public.member as m WHERE "steamName" LIKE :name LIMIT 1)',
              {
                name: playerName + '%',
              },
            );
          }),
        )
        .andWhere('eventId = :eventId', { eventId })
        .execute();
      resolve();
    });
  }
}
