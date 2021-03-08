import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CollectorFilter, MessageEmbed, MessageReaction, User } from 'discord.js';
import { DiscordConfig } from '../../../config/discord.config';
import { EmbedConfig } from '../../../config/embeds.config';
import { EnrolByDiscordDto } from '../../../enrolments/dto/enrolByDiscord.dto';
import { EnrolmentsDiscordService } from '../../../enrolments/enrolments-discord.service';
import { Division, EnrolmentType, HLLEvent } from '../../../postgres/entities';
import { UsersService } from '../../../users/users.service';

export type RoleSelectionType = {
  squadlead: boolean;
  commander: boolean;
};
type DivisionMatrixEntry = {
  default: string;
  squadlead: string;
};
const divisionMatrix: { [key: string]: DivisionMatrixEntry } = {
  infanterie: { default: 'Fußsoldat', squadlead: 'Offizier' },
  armor: { default: 'Scharfschütze', squadlead: '' },
  recon: { default: '', squadlead: 'Spotter' },
  artillery: { default: 'Panzerbesatzung', squadlead: 'Panzerkommandant' },
};
const enrolmentMatrix = {
  AN: 'angemeldet',
  AB: 'abgemeldet',
  RE: 'auf Reserve gesetzt',
};

@Injectable()
export class RegistrationDialog {
  private embedConfig: EmbedConfig;
  private discordConfig: DiscordConfig;
  private emojis = ['💂‍♂️', '🤠', '🕵️‍♂️', '❌'];
  private collectionFilter: CollectorFilter = (reaction: MessageReaction, user: User) => {
    if (user.bot) return false;
    return this.emojis.includes(reaction.emoji.name);
  };

  constructor(
    private enrolmentService: EnrolmentsDiscordService,
    private userService: UsersService,
    config: ConfigService,
  ) {
    this.embedConfig = config.get('embed') as EmbedConfig;
    this.discordConfig = config.get('discord') as DiscordConfig;
  }

  async startDialog(enrolmentType: EnrolmentType, user: User, event: HLLEvent) {
    const division = await this.userService.getDivisionForMember(user.id);
    if (!division) return;

    this.roleSelection(user, division)
      .then((roleSelection) => {
        const enrolDto: EnrolByDiscordDto = {
          type: enrolmentType,
          memberId: user.id,
          eventId: event.id,
          division: division,
          squadlead: roleSelection.squadlead,
          commander: roleSelection.commander,
        };
        this.enrolmentService
          .enrol(enrolDto)
          .then(() => {
            user.send(
              `Du hast dich erfolgreich für das Event ${event.name} ${enrolmentMatrix[enrolmentType]}`,
            );
          })
          .catch(() => {
            user.send('ERROR: Bitte informiere einen Admin und probiere es nochmal');
          });
      })
      .catch((errorString) => {
        user.send(errorString);
      });
  }

  private roleSelection(user: User, division: Division): Promise<RoleSelectionType> {
    return new Promise<RoleSelectionType>(async (resolve, reject) => {
      const msg = await user.send(this.getEmbed(division));

      for (const emoji of this.emojis) await msg.react(emoji);

      const collector = msg.createReactionCollector(this.collectionFilter);

      const timeout = setTimeout(async () => {
        collector.stop();
        reject('Zeitlimit überschritten');
      }, 60000);

      collector.on('collect', (reaction: MessageReaction) => {
        collector.stop();
        clearTimeout(timeout);
        if (reaction.emoji.name == '❌') reject('Anmeldung abgebrochen');
        resolve({
          squadlead: reaction.emoji.name === '🤠',
          commander: reaction.emoji.name === '🕵️‍♂️',
        });
      });
    });
  }

  private getEmbed(division: Division): MessageEmbed {
    return new MessageEmbed()
      .setColor(this.embedConfig.color)
      .setTitle('Als was willst du dich anmelden?')
      .setDescription(
        [
          `${divisionMatrix[division].default} - 💂‍♂️`,
          `${divisionMatrix[division].default} - 🤠`,
          'Kommandant - 🕵️‍♂️',
          'Abbrechen - ❌',
        ].join('\n'),
      )
      .setURL(this.embedConfig.baseUrl)
      .setTimestamp();
  }
}
