import { Util } from 'discord.js';
import { EmbedConfig } from '../../../config/embeds.config';
import { Enrolment, EnrolmentType, HLLEvent } from '../../../typeorm/entities';
import { DefaultMessage } from './default.message';
import { EmojiWrapper } from './enrolmentMessage.factory';

class DivisionEnrolments {
  infanterie: string[] = [];
  armor: string[] = [];
  recon: string[] = [];
  artillery: string[] = [];
}

export class EnrolmentMessage extends DefaultMessage {
  private reservePool: string[] = [];
  private abmeldungPool: string[] = [];

  private iterator = (fn: (name: string, enrolment: Enrolment) => void) => {
    this.enrolments.forEach((enrolment) => {
      const name = this.formatName(enrolment);
      switch (enrolment.enrolmentType) {
        case EnrolmentType.ANMELDUNG:
          fn(name, enrolment);
          break;
        case EnrolmentType.RESERVE:
          this.reservePool.push(name);
          break;
        default:
          this.abmeldungPool.push(name);
      }
    });
  };

  constructor(
    private event: HLLEvent,
    private emojis: EmojiWrapper,
    private enrolments: Enrolment[],
    config: EmbedConfig,
  ) {
    super(event, config);
    this.setURL(`${config.baseUrl}enrolment/${event.id}`).setTitle(event.name);
    this.loadEnrolments();
  }

  private loadEnrolments() {
    if (this.event.singlePool) this.loadSinglePool();
    else this.loadSeparatePools();
    this.addDefaultPools();
  }

  private loadSinglePool() {
    const an: string[] = [];

    const fn = (name: string) => {
      an.push(name);
    };
    this.iterator(fn);

    const halflength = Math.ceil(an.length) + 1;

    this.addPool(`Anmeldungen (${an.length})`, an.slice(0, halflength));
    this.addPool('\u200B', an.slice(halflength));
  }

  private loadSeparatePools() {
    const divisions: DivisionEnrolments = new DivisionEnrolments();

    const fn = (name: string, enrolment: Enrolment) => {
      divisions[enrolment.division].push(name);
    };
    this.iterator(fn);

    const anmeldungen = Object.values(divisions)
      .map((div) => div.length)
      .reduce((acc, cur) => acc + cur);
    this.setTitle(`Anmeldungen - ${anmeldungen}`);

    this.addPool(`Infanterie (${divisions.infanterie.length})`, divisions.infanterie, true);
    this.addPool(`Panzer (${divisions.armor.length})`, divisions.armor, true);
    this.addField('\u200B', '\u200B');
    this.addPool(`Aufklärer (${divisions.recon.length})`, divisions.recon, true);
    this.addPool(`Artillerie (${divisions.artillery.length})`, divisions.artillery, true);
  }

  private formatName(enrolment: Enrolment): string {
    //@ts-ignore
    let name = enrolment.name || enrolment.username;
    name = Util.escapeMarkdown(this.stripName(name));
    if (enrolment.squadlead) name += ` ${this.emojis.squadlead}`;
    if (enrolment.commander) name += ` ${this.emojis.commander}`;
    return name;
  }

  private stripName(name: string) {
    return name.split('|').slice(1).join('|');
  }

  private addPool(header: string, members: string[], inline?: boolean) {
    this.addField(header, this.joinMemberList(members), inline);
  }

  private addDefaultPools() {
    this.addField('\u200B', '\u200B');
    this.addPool(`Reserve (${this.reservePool.length})`, this.reservePool, true);
    this.addPool(`Abmeldungen (${this.abmeldungPool.length})`, this.abmeldungPool, true);
  }

  private joinMemberList(members: string[]): string {
    return members.length > 0 ? members.join('\n') : '\u200B';
  }
}
