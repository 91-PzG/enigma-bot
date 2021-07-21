import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnCommand } from 'discord-nestjs';
import { DMChannel, Message, NewsChannel, TextChannel } from 'discord.js';
import { query, QueryResult } from 'gamedig';
import { Repository } from 'typeorm';
import { Enrolment, HLLEvent } from '../../postgres/entities';

@Injectable()
export class AttendanceCommand {
  constructor(
    @InjectRepository(HLLEvent)
    private hllEventRepository: Repository<HLLEvent>,
    @InjectRepository(Enrolment)
    private enrolmentRepository: Repository<Enrolment>,
  ) {}

  @OnCommand({ name: 'anwesend', isRemoveMessage: true })
  async attendanceCommandDiscordWrapper(message: Message): Promise<any> {
    const [, eventId, socket] = message.content.split(' ');
    if (!this.validateSocket(socket))
      return this.sendFeedbackMessage(message.channel, 'Ungültiger Socket');

    if (!(await this.validateEventId(eventId)))
      return this.sendFeedbackMessage(message.channel, 'Ungültige Eventid');

    return this.attendanceCommand(Number(eventId), socket)
      .then(() => this.sendFeedbackMessage(message.channel, 'Anwesenheit erfolgreich eingetragen'))
      .catch((error: NotFoundException) =>
        this.sendFeedbackMessage(message.channel, error.message),
      );
  }

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
        port: Number(port),
      })
        .then((result) => resolve(result))
        .catch(() => resolve(null)),
    );
  }

  private async validateEventId(eventId: string): Promise<boolean> {
    const id = Number(eventId);

    if (isNaN(id)) return false;

    return (await this.hllEventRepository.count({ id })) == 1;
  }

  private validateSocket(socket: string): boolean {
    return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):(6553[0-5]|655[0-2][0-9]|65[0-4][0-9][0-9]|6[0-4][0-9][0-9][0-9][0-9]|[1-5](\d){4}|[1-9](\d){0,3})$/.test(
      socket,
    );
  }

  private sendFeedbackMessage(
    channel: TextChannel | DMChannel | NewsChannel,
    message: string,
    timeout = 5000,
  ): void {
    channel.send(message).then((msg) => msg.delete({ timeout }));
  }

  private setAttendance(playerName: string, eventId: number) {
    if (!playerName) return;
    return new Promise<void>(async (resolve) => {
      await this.enrolmentRepository
        .createQueryBuilder()
        .update()
        .set({ isPresent: true })
        .where('username LIKE :name', { name: playerName + '%' })
        .andWhere('eventId =: eventId', { eventId })
        .execute();
      resolve();
    });
  }
}
