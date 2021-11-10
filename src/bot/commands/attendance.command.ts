import { TransformPipe } from '@discord-nestjs/common';
import { Command, DiscordTransformedCommand, Param, Payload, UsePipes } from '@discord-nestjs/core';
import { Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandInteraction } from 'discord.js';
import { query, QueryResult } from 'gamedig';
import { Repository } from 'typeorm';
import { Enrolment, HLLEvent } from '../../typeorm/entities';

class AttendanceDto {
  @Param({
    name: 'EventId',
    description: 'Id of the event (can be found in the footer)',
    required: true,
  })
  eventId: string;
  @Param({
    name: 'ServerSocker',
    description: 'IP and Port of the gameserver (can be found on battlemetrics)',
    required: true,
  })
  socket: string;
}

@Command({
  name: 'anwesend',
  description: 'Anwesenheitsüberprüfung für Events',
})
@UsePipes(TransformPipe)
export class AttendanceCommand implements DiscordTransformedCommand<AttendanceDto> {
  logger = new Logger('AttendanceCommand');

  constructor(
    @InjectRepository(HLLEvent)
    private hllEventRepository: Repository<HLLEvent>,
    @InjectRepository(Enrolment)
    private enrolmentRepository: Repository<Enrolment>,
  ) {}

  async handler(@Payload() dto: AttendanceDto, interaction: CommandInteraction): Promise<any> {
    if (!this.validateSocket(dto.socket))
      return this.sendFeedbackMessage(interaction, 'Ungültiger Socket');

    if (!(await this.validateEventId(dto.eventId)))
      return this.sendFeedbackMessage(interaction, 'Ungültige Eventid');

    this.attendanceCommand(parseInt(dto.eventId, 10), dto.socket)
      .then(() => this.sendFeedbackMessage(interaction, 'Anwesenheit erfolgreich eingetragen'))
      .catch((error: NotFoundException) => this.sendFeedbackMessage(interaction, error.message));
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
    return /^(?:(?:25[0-5]|2[0-4][\d]|[01]?[\d][\d]?)\.){3}(?:25[0-5]|2[0-4][\d]|[01]?[\d][\d]?):(6553[0-5]|655[0-2][\d]|65[0-4][\d][\d]|6[0-4][\d][\d][\d][\d]|[1-5](\d){4}|[1-9](\d){0,3})$/.test(
      socket,
    );
  }

  private sendFeedbackMessage(
    interaction: CommandInteraction,
    content: string,
    timeout = 5000,
  ): void {
    interaction.reply({ content, ephemeral: true });
  }

  private setAttendance(playerName: string, eventId: number) {
    if (!playerName) return;
    return new Promise<void>(async (resolve) => {
      await this.enrolmentRepository
        .createQueryBuilder()
        .update()
        .set({ isPresent: true })
        .where('username LIKE :name', { name: playerName + '%' })
        .andWhere('eventId = :eventId', { eventId })
        .execute();
      resolve();
    });
  }
}
