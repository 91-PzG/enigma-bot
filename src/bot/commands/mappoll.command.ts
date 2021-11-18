import { TransformPipe } from '@discord-nestjs/common';
import { Command, DiscordTransformedCommand, Payload, UsePipes } from '@discord-nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandInteraction } from 'discord.js';
import { Repository } from 'typeorm';
import { HLLEvent } from '../../typeorm/entities';
import { MappollService } from '../services/mappoll.service';
import { MappollDto } from './dto/mapvote.dto';

@Command({
  name: 'mappoll',
  description: 'Starts a new mapvote',
})
@UsePipes(TransformPipe)
export class MappollCommand implements DiscordTransformedCommand<MappollDto> {
  constructor(
    @InjectRepository(HLLEvent) private hllEventRepository: Repository<HLLEvent>,
    private service: MappollService,
  ) {}

  async handler(@Payload() dto: MappollDto, interaction: CommandInteraction): Promise<void> {
    if (dto.eventId && !(await this.validateEventId(dto.eventId)))
      return this.sendFeedbackMessage(interaction, 'Ungültige Eventid');

    await this.service.createPoll(interaction, Number.parseInt(dto.eventId) || null);
  }

  private async validateEventId(eventId: string): Promise<boolean> {
    const id = Number(eventId);

    if (isNaN(id)) return false;

    return (await this.hllEventRepository.count({ id })) === 1;
  }

  private sendFeedbackMessage(interaction: CommandInteraction, content: string): void {
    interaction.reply({ content, ephemeral: true });
  }
}
