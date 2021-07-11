import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CollectorFilter, MessageEmbed, MessageReaction, User } from 'discord.js';
import { EmbedConfig } from '../../../config/embeds.config';
import { EnrolByDiscordDto } from '../../../enrolments/dto/enrolByDiscord.dto';
import { EnrolmentsDiscordService } from '../../../enrolments/enrolments-discord.service';
import { Division, EnrolmentType, HLLEvent, Member } from '../../../postgres/entities';

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
  artillery: { default: 'Geschützbesatzung', squadlead: 'Batterieführer' },
  recon: { default: 'Aufklärer', squadlead: 'Spotter' },
  armor: { default: 'Panzerbesatzung', squadlead: 'Panzerkommandant' },
};
const enrolmentMatrix = {
  AN: 'angemeldet',
  AB: 'abgemeldet',
  RE: 'auf Reserve gesetzt',
};

@Injectable()
export class RegistrationDialog {
  private embedConfig: EmbedConfig;
  private emojis = ['💂‍♂️', '🤠', '🕵️‍♂️', '❌'];
  private collectionFilter: CollectorFilter = (reaction: MessageReaction, user: User) => {
    if (user.bot) return false;
    return this.emojis.includes(reaction.emoji.name);
  };

  constructor(private enrolmentService: EnrolmentsDiscordService, config: ConfigService) {
    this.embedConfig = config.get('embed');
  }

  async startDialog(enrolmentType: EnrolmentType, user: User, event: HLLEvent, member: Member) {
    return new Promise<void>((resolve, reject) => {
      this.createDto(enrolmentType, member, event, user)
        .then(async (dto) => {
          this.enrol(dto, user, event)
            .then(() => resolve())
            .catch(() => reject());
        })
        .catch(() => reject());
    });
  }

  private createDto(
    type: EnrolmentType,
    member: Member,
    event: HLLEvent,
    user: User,
  ): Promise<EnrolByDiscordDto> {
    return new Promise<EnrolByDiscordDto>((resolve, reject) => {
      const dto = {
        type: type,
        member: member,
        eventId: event.id,
        division: member.division,
        squadlead: false,
        commander: false,
      };

      if (type !== EnrolmentType.ABMELDUNG) {
        this.roleSelection(user, member.division, type)
          .then((selection) => {
            dto.squadlead = selection.squadlead;
            dto.commander = selection.commander;
            resolve(dto);
          })
          .catch((errorMsg) => {
            user.send(errorMsg);
            reject();
          });
      } else {
        resolve(dto);
      }
    });
  }

  private enrol(dto: EnrolByDiscordDto, user: User, event: HLLEvent): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.enrolmentService
        .enrol(dto)
        .then(() => {
          user.send(
            `Du hast dich erfolgreich für das Event ${event.name} ${enrolmentMatrix[dto.type]}`,
          );
          resolve();
        })
        .catch(() => {
          user.send('Es ist ein Fehler aufgetreten!\nBitte informiere einen Admin');
          reject();
        });
    });
  }

  private roleSelection(
    user: User,
    division: Division,
    type: EnrolmentType,
  ): Promise<RoleSelectionType> {
    return new Promise<RoleSelectionType>(async (resolve, reject) => {
      const msg = await user.send(this.getEmbed(division, type));

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

  private getEmbed(division: Division, type: EnrolmentType): MessageEmbed {
    const enrolmentString = type === EnrolmentType.ANMELDUNG ? 'anmelden' : 'auf Reserve setzen';
    return new MessageEmbed()
      .setColor(this.embedConfig.color)
      .setTitle(`Als was willst du dich ${enrolmentString}?`)
      .setDescription(
        [
          `${divisionMatrix[division].default} - 💂‍♂️`,
          `${divisionMatrix[division].squadlead} - 🤠`,
          'Kommandant - 🕵️‍♂️',
          'Abbrechen - ❌',
        ].join('\n'),
      )
      .setURL(this.embedConfig.baseUrl)
      .setTimestamp();
  }
}
