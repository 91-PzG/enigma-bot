import { TransformPipe } from '@discord-nestjs/common';
import { Command, DiscordTransformedCommand, Payload, UsePipes } from '@discord-nestjs/core';
import { Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandInteraction } from 'discord.js';
import { Repository } from 'typeorm';
import { HLLEvent } from '../../typeorm/entities';
import { AttendanceService } from '../attendance.service';
import { AttendanceDto } from './dto/attendance.dto';

@Command({
  name: 'attendance',
  description: 'Sets the attendance for an event by querying a HLL Server',
})
@UsePipes(TransformPipe)
export class AttendanceCommand implements DiscordTransformedCommand<AttendanceDto> {
  logger = new Logger('PlayCommand');
  constructor(
    @InjectRepository(HLLEvent) private hllEventRepository: Repository<HLLEvent>,
    private service: AttendanceService,
  ) {}

  async handler(@Payload() dto: AttendanceDto, interaction: CommandInteraction): Promise<void> {
    if (!this.validateSocket(dto.socket))
      return this.sendFeedbackMessage(interaction, 'Ungültiger Socket');
    if (!(await this.validateEventId(dto.eventId)))
      return this.sendFeedbackMessage(interaction, 'Ungültige Eventid');
    return this.service
      .attendanceCommand(parseInt(dto.eventId, 10), dto.socket)
      .then(() => this.sendFeedbackMessage(interaction, 'Anwesenheit erfolgreich eingetragen'))
      .catch((error: NotFoundException) => this.sendFeedbackMessage(interaction, error.message));
  }

  private async validateEventId(eventId: string): Promise<boolean> {
    const id = Number(eventId);

    if (isNaN(id)) return false;

    return (await this.hllEventRepository.count({ id })) === 1;
  }

  private validateSocket(socket: string): boolean {
    return /^(?:(?:25[0-5]|2[0-4][\d]|[01]?[\d][\d]?)\.){3}(?:25[0-5]|2[0-4][\d]|[01]?[\d][\d]?):(6553[0-5]|655[0-2][\d]|65[0-4][\d][\d]|6[0-4][\d][\d][\d][\d]|[1-5](\d){4}|[1-9](\d){0,3})$/.test(
      socket,
    );
  }

  private sendFeedbackMessage(interaction: CommandInteraction, content: string): void {
    interaction.reply({ content, ephemeral: true });
  }
}
