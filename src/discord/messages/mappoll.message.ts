import { EmbedConfig } from '../../config/embeds.config';
import { mapRegistry } from '../../config/mapregistry';
import { HLLWarfareMaps, Mappoll } from '../../typeorm/entities';
import { MappollvotesView } from '../../typeorm/entities/mapvotes.view';
import { DefaultMessage } from './default.message';

export class MappollMessage extends DefaultMessage {
  constructor(config: EmbedConfig, poll: Mappoll, mapVotes: MappollvotesView) {
    super(config);

    let footer = `Mappoll #${poll.id}`;
    if (poll.eventId) footer += ` - linked to Event #${poll.eventId}`;

    let mapnames = '';
    let votes = '';
    let sumVotes = 0;
    Object.values(HLLWarfareMaps).forEach((map) => {
      const mapConfig = mapRegistry[map];
      mapnames += mapConfig.emoji + ' - ' + mapConfig.name + '\n';
      const vote = mapVotes ? mapVotes[map] : 0;
      sumVotes += vote;
      votes += vote.toString() + '\n';
    });

    this.setTitle('Mapvote')
      .setFooter(footer)
      .addField('Maps', mapnames, true)
      .addField(`Votes ${sumVotes}`, votes, true);
  }
}
