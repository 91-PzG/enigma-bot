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
    Object.values(HLLWarfareMaps).forEach((map) => {
      const mapConfig = mapRegistry[map];
      mapnames += mapConfig.emoji + ' - ' + mapConfig.name + '\n';
      votes += (mapVotes ? mapVotes[map] : '0') + '\n';
    });

    this.setTitle('Mapvote')
      .setFooter(footer)
      .addField('Maps', mapnames, true)
      .addField('Votes', votes, true);
  }
}
