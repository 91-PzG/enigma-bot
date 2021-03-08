import { EmbedConfig } from '../../../config/embeds.config';
import { HLLEvent } from '../../../postgres/entities';
import { DefaultMessage } from './default.message';

const translationMatrix: { [key: string]: string } = {
  date: 'Datum:',
  registerByDate: 'Anmeldefrist:',
  mandatory: 'Verpflichtend:',
  rounds: 'Runden:',
  hllMap: 'Karte:',
  commander: 'Kommandant:',
  moderator: 'Leiter:',
  duration: 'Dauer:',
  meetingPoint: 'Treffpunkt:',
  server: 'Server:',
  password: 'Passwort:',
  maxPlayerCount: 'max. Spielerzahl:',
  briefing: 'Vorbesprechung',
};

const eventReductor = (acc: [string, any], [key, value]: [string, any]): [string, any] => {
  const translated = translationMatrix[key];
  if (value != undefined && translated) acc.push([translated, value]);
  return acc;
};

export class InformationMessage extends DefaultMessage {
  constructor(private event: HLLEvent, config: EmbedConfig) {
    super(event, config);
    this.setDescription(event.description)
      .setURL(`${config.baseUrl}events/${event.id}`)
      .setTitle(event.name);
    this.addOptionalFields();
  }

  private addOptionalFields() {
    const fields = Object.entries(this.event).reduce(
      eventReductor,
      ([] as unknown) as [string, any],
    );
    fields.forEach(([key, value]) => {
      this.addField(key, value, true);
    });
  }
}
