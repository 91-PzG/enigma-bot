import { On, UseGuards } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ButtonInteraction } from 'discord.js';
import { EnrolByDiscordDto } from '../../enrolments/dto/enrolByDiscord.dto';
import { EnrolmentsDiscordService } from '../../enrolments/enrolments-discord.service';
import { EnrolmentType } from '../../typeorm/entities';
import { UsersService } from '../../users/users.service';
import { ButtonGuard } from '../../util/guards/button.guard';
import { RegistrationGuard } from '../../util/guards/registration.guard';
import { HLLEventRepository } from '../hllevent.repository';
import { HLLEventsDiscordService } from './hllevent-discord.service';

@Injectable()
export class RegistrationService {
  logger = new Logger('RegistrationService');

  constructor(
    private eventsRepository: HLLEventRepository,
    private hllEventsDiscordService: HLLEventsDiscordService,
    private enrolmentsDiscordService: EnrolmentsDiscordService,
    private usersService: UsersService,
  ) {}

  @On('interactionCreate')
  @UseGuards(ButtonGuard, RegistrationGuard)
  async register(interaction: ButtonInteraction) {
    const eventId = parseInt(interaction.customId.split('-')[0], 10);
    const event = await this.eventsRepository.getEventById(eventId);
    if (!event) return;
    if (event.closed || (event.locked && !interaction.customId.includes('cancel'))) {
      this.sendError(interaction, `Du kannst dich bei Event #${eventId} nicht mehr anmelden`);
      this.hllEventsDiscordService.updateEnrolmentMessage(event, interaction);
      return;
    }

    const dto = await this.createEnrolmentDto(interaction);
    if (!dto) return;

    this.enrolmentsDiscordService
      .enrol(dto)
      .then(() => {
        this.hllEventsDiscordService
          .updateEnrolmentMessage(event, interaction)
          .then(() => {
            this.sendSuccess(interaction, dto);
          })
          .catch((e) => {
            this.logger.error(e);
            this.sendError(
              interaction,
              'Fehler beim update der Nachricht. Bitte versuche es später erneut',
            );
          });
      })
      .catch(() =>
        this.sendError(interaction, 'Fehler bei der Anmeldung. Bitte versuche es später erneut'),
      );
  }

  private sendSuccess(interaction: ButtonInteraction, dto: EnrolByDiscordDto) {
    const roleString = dto.commander ? ' als Kommandant ' : dto.squadlead ? ' als Squadlead ' : ' ';
    interaction.reply({
      content: `Du hast dich erfolgreich${roleString}${
        dto.type === EnrolmentType.ANMELDUNG ? 'an' : 'ab'
      }gemeldet!`,
      ephemeral: true,
    });
  }

  private sendError(interaction: ButtonInteraction, content: string) {
    interaction.reply({
      content,
      ephemeral: true,
    });
  }

  private async createEnrolmentDto(interaction: ButtonInteraction): Promise<EnrolByDiscordDto> {
    const { customId } = interaction;
    const member = await this.usersService.getActiveMember(interaction.user.id);
    const type: EnrolmentType = customId.includes('cancel')
      ? EnrolmentType.ABMELDUNG
      : EnrolmentType.ANMELDUNG;
    const eventId = parseInt(customId.split('-')[0], 10);

    return {
      type,
      eventId,
      member,
      division: member.division,
      squadlead: customId.includes('squadlead'),
      commander: customId.includes('commander'),
    };
  }
}
