import { Util } from 'discord.js';
import { EmbedConfig } from '../../../config/embeds.config';
import { Enrolment, EnrolmentType, HLLEvent, Squad } from '../../../typeorm/entities';
import { DefaultMessage } from './default.message';
import { EmojiWrapper } from './enrolmentMessage.factory';

class EnrolmentSquad {
  constructor(public name: string, public id: number) {}
  members: string[] = [];
}

export class EnrolmentMessage extends DefaultMessage {
  private abmeldungPool: string[] = [];
  private anmeldungPool: string[] = [];
  private squadPool: EnrolmentSquad[] = [];
  private assigned: number = 0;

  constructor(
    private event: HLLEvent,
    private emojis: EmojiWrapper,
    private enrolments: Enrolment[],
    private squads: Squad[],
    config: EmbedConfig,
  ) {
    super(event, config);
    this.setURL(`${config.baseUrl}enrolment/${event.id}`);
    this.loadEnrolments();
  }

  private loadEnrolments() {
    if (this.event.showSquads) this.initSquads();
    this.sortEnrolments();
    this.addPools();
  }

  private initSquads() {
    this.squads.forEach((squad) => {
      this.squadPool.push(new EnrolmentSquad(squad.name, squad.id));
    });
  }

  private sortEnrolments() {
    let iterator: (enrolment?: Enrolment) => void;
    if (this.event.showSquads) {
      iterator = this.defaultIterator((name: string, enrolment: Enrolment) => {
        if (enrolment.squadId) {
          this.squadPool
            .find((squad: EnrolmentSquad) => squad.id === enrolment.squadId)
            .members.push(name);
          return this.assigned++;
        }
        this.abmeldungPool.push(name);
      });
    } else {
      iterator = this.defaultIterator((name: string) => this.anmeldungPool.push(name));
    }

    this.enrolments.forEach(iterator);

    const registrationCount = this.anmeldungPool.length.toString();
    const assignedTitle = this.event.showSquads && `${this.assigned}/` + registrationCount;
    this.setTitle(`Anmeldungen (${assignedTitle})`);
  }

  private defaultIterator = (
    iterator: (name: string, enrolment?: Enrolment) => void,
  ): ((enrolment: Enrolment) => void) => {
    return (enrolment: Enrolment) => {
      const name = this.formatName(enrolment);
      if (enrolment.enrolmentType === EnrolmentType.ABMELDUNG) return this.abmeldungPool.push(name);
      iterator(name, enrolment);
    };
  };

  private formatName(enrolment: Enrolment): string {
    //@ts-ignore
    let name = enrolment.name || enrolment.username;
    name = Util.escapeMarkdown(this.stripName(name));
    if (enrolment.squadlead) name += ` ${this.emojis.squadlead}`;
    if (enrolment.commander) name += ` ${this.emojis.commander}`;
    return name;
  }

  private stripName(name: string) {
    return name.includes('91.') ? name.split('|').slice(1).join('|') : name;
  }

  private addPool(header: string, members: string[], inline: boolean = true) {
    this.addField(header, this.joinMemberList(members), inline);
  }

  private addPools() {
    this.addPool(`Anmeldungen (${this.anmeldungPool.length})`, this.anmeldungPool);
    if (this.event.showSquads) this.addSquad(this.squadPool);
    this.addPool(`Abmeldungen (${this.abmeldungPool.length})`, this.abmeldungPool);
  }

  private addSquad(squads: EnrolmentSquad[]) {
    squads.forEach((squad) =>
      this.addPool(`${squad.name} (${squad.members.length})`, squad.members),
    );
  }

  private joinMemberList(members: string[]): string {
    return members.length > 0 ? members.join('\n') : '\u200B';
  }
}
