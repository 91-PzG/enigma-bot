import { Util } from 'discord.js';
import { EmbedConfig } from '../../../config/embeds.config';
import { RosterDto, SquadDto } from '../../../enrolments/dto/roster.dto';
import { Enrolment, HLLEvent, HLLRole } from '../../../postgres/entities';
import { DefaultMessage } from './default.message';
import { EmojiWrapper } from './enrolmentMessage.factory';

export class RosterMessage extends DefaultMessage {
  constructor(
    private roster: RosterDto,
    event: HLLEvent,
    private emojis: EmojiWrapper,
    config: EmbedConfig,
  ) {
    super(event, config);
    this.setURL(`${config.baseUrl}enrolment/${event.id}`).setTitle(
      `Aufstellung für - ${event.name}`,
    );
    this.addCommander();
  }

  addCommander() {
    if (this.roster.commander) this.addField('Kommandant', this.roster.commander, true);
  }

  addDivisions() {
    this.addSquads(this.roster.infanterie.squads);
    this.addSquads(this.roster.armor.squads);
    this.addSquads(this.roster.recon.squads);
    this.addSquads(this.roster.artillery.squads);
  }

  addSquads(squads: SquadDto[]) {
    const reducer = (accumulator: string, currentValue: Enrolment) => {
      accumulator += Util.escapeMarkdown(currentValue.username);
      if (currentValue.role == HLLRole.OFFICER) accumulator += ` ${this.emojis.squadlead}`;
      return accumulator + '\n';
    };

    for (const squad of squads) {
      const squadMembers = squad.members ? squad.members.reduce(reducer, '') : '-';
      this.addField(squad.name, squadMembers, true);
    }
  }
}
