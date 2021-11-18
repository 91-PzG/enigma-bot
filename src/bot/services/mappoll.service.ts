import { On, UseGuards } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ButtonInteraction,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
} from 'discord.js';
import { Repository } from 'typeorm';
import { mapRegistry } from '../../config/mapregistry';
import { MappollMessageFactory } from '../../discord/messages/mappollMessage.factory';
import {
  Enrolment,
  EnrolmentType,
  HLLWarfareMaps,
  Mappoll,
  Mappollvote,
} from '../../typeorm/entities';
import { ButtonGuard } from '../../util/guards/button.guard';
import { MappollGuard } from '../../util/guards/mappoll.guard';

@Injectable()
export class MappollService {
  constructor(
    @InjectRepository(Mappoll) private mappollRepository: Repository<Mappoll>,
    @InjectRepository(Mappollvote) private mappollvoteRepository: Repository<Mappollvote>,
    @InjectRepository(Enrolment) private enrolmentRepository: Repository<Enrolment>,
    private mappollMessageFactory: MappollMessageFactory,
  ) {}

  @On('interactionCreate')
  @UseGuards(ButtonGuard, MappollGuard)
  async vote(interaction: ButtonInteraction) {
    const [pollIdString, map, eventId] = interaction.customId.split('-').slice(1);
    const pollId = Number.parseInt(pollIdString);
    const memberId = interaction.user.id;

    const poll = await this.mappollRepository.findOne(pollId);
    if (!poll) return;

    if (eventId) {
      const count = await this.enrolmentRepository.count({
        eventId: Number.parseInt(eventId),
        memberId,
        enrolmentType: EnrolmentType.ANMELDUNG,
      });
      if (!count)
        return interaction.reply({
          content: 'Du hast dich nicht für dieses Event angemeldet',
          ephemeral: true,
        });
    }

    const id = (await this.mappollvoteRepository.findOne({ memberId, pollId }))?.id;

    await this.mappollvoteRepository.save({
      memberId,
      pollId: pollId,
      map: map as HLLWarfareMaps,
      id,
    });

    const embed = await this.mappollMessageFactory.createMessage(poll);
    const components = this.createActionRows(poll);
    await (interaction.message as Message).edit({ embeds: [embed], components });
    interaction.reply({ content: 'Abstimmung erolgreich', ephemeral: true });
  }

  async createPoll(interaction: CommandInteraction, eventId?: number) {
    const poll = await this.mappollRepository.save({ eventId });

    const embed = await this.mappollMessageFactory.createMessage(poll);
    const components = this.createActionRows(poll);
    interaction.channel
      .send({ embeds: [embed], components })
      .then(() => interaction.reply({ content: 'Successfully created mapvote', ephemeral: true }));
  }

  private createActionRows(poll: Mappoll): MessageActionRow[] {
    const actionRows: MessageActionRow[] = [];
    for (let i = 0; i < Object.keys(HLLWarfareMaps).length / 5; i++) {
      actionRows.push(
        this.createActionRow(Object.values(HLLWarfareMaps).slice(i * 5, (i + 1) * 5), poll),
      );
    }
    return actionRows;
  }

  private createActionRow(maps: HLLWarfareMaps[], poll: Mappoll): MessageActionRow {
    const row = new MessageActionRow();
    maps.forEach((map) => {
      const mapConfig = mapRegistry[map];
      row.addComponents(
        new MessageButton({
          customId: `poll-${poll.id}-${map}${poll.eventId ? '-' + poll.eventId : ''}`,
          style: 'SECONDARY',
          label: mapConfig.name,
          emoji: mapConfig.emoji,
        }),
      );
    });
    return row;
  }
}
