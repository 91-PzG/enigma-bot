import { Util } from 'discord.js';
import { EmbedConfig } from '../../../config/embeds.config';
import { Enrolment, EnrolmentType, HLLEvent, Squad } from '../../../typeorm/entities';
import { DefaultMessage } from './default.message';
import { EmojiWrapper } from './enrolmentMessage.factory';

class DivisionEnrolments<T> {
  infanterie: T[] = [];
  armor: T[] = [];
  recon: T[] = [];
  artillery: T[] = [];
}

class EnrolmentSquad {
  constructor(public name: string, public id: number) {}
  members: string[] = [];
}

export class EnrolmentMessage extends DefaultMessage {
  private abmeldungPool: string[] = [];
  private squadPool: DivisionEnrolments<EnrolmentSquad> = new DivisionEnrolments<EnrolmentSquad>();

  private iterator = (fn: (name: string, enrolment: Enrolment) => void) => {
    this.enrolments.forEach((enrolment) => {
      const name = this.formatName(enrolment);
      if (enrolment.enrolmentType === EnrolmentType.ABMELDUNG) {
        this.abmeldungPool.push(name);
      } else if (this.event.showSquads && enrolment.squadId) {
        this.squadPool[enrolment.division].find(
          (squad: EnrolmentSquad) => squad.id === enrolment.squadId,
        ).members[enrolment.position] = name;
      } else {
        fn(name, enrolment);
      }
    });
  };

  constructor(
    private event: HLLEvent,
    private emojis: EmojiWrapper,
    private enrolments: Enrolment[],
    private squads: Squad[],
    config: EmbedConfig,
  ) {
    super(event, config);
    this.setURL(`${config.baseUrl}enrolment/${event.id}`).setTitle(event.name);
    this.loadEnrolments();
  }

  private loadEnrolments() {
    if (this.event.showSquads) this.initSquads();
    if (this.event.singlePool) this.loadSinglePool();
    else this.loadSeparatePools();
    this.addDefaultPools();
  }

  private initSquads() {
    this.squads.forEach((squad) => {
      this.squadPool[squad.division].push(new EnrolmentSquad(squad.name, squad.id));
    });
  }

  private loadSinglePool() {
    const an: string[] = this.enrolments
      .filter(
        (enrolment) =>
          enrolment.enrolmentType === EnrolmentType.ANMELDUNG && enrolment.squadId === null,
      )
      .map((enrolment) => this.formatName(enrolment));

    const fn = (name: string) => {
      an.push(name);
    };
    this.iterator(fn);

    const halflength = Math.ceil(an.length) + 1;

    this.addPool(`Anmeldungen (${an.length})`, an.slice(0, halflength));
    this.addPool('\u200B', an.slice(halflength));
  }

  private loadSeparatePools() {
    const divisions: DivisionEnrolments<string> = new DivisionEnrolments<string>();

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
    return name.includes('91.') ? name.split('|').slice(1).join('|') : name;
  }

  private addPool(header: string, members: string[], inline?: boolean) {
    this.addField(header, this.joinMemberList(members), inline);
  }

  private addDefaultPools() {
    this.addField('\u200B', '\u200B');
    if (this.event.showSquads)
      Object.keys(this.squadPool).forEach((division) => this.addSquad(this.squadPool[division]));
    this.addPool(`Abmeldungen (${this.abmeldungPool.length})`, this.abmeldungPool, true);
  }

  private addSquad(squads: EnrolmentSquad[]) {
    squads.forEach((squad) =>
      this.addPool(`${squad.name} (${squad.members.length})`, squad.members, true),
    );
  }

  private joinMemberList(members: string[]): string {
    return members.length > 0 ? members.join('\n') : '\u200B';
  }
}
