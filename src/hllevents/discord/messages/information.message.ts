import { EmbedConfig } from '../../../config/embeds.config';
import { HLLEvent } from '../../../typeorm/entities';
import { dateTransformationPipe } from '../../../util/dateTransformation.pipe';
import { DefaultMessage } from './default.message';

type Translation = {
  name: string;
  valuePipe?: (value: any) => string;
};

const boolTransformation = (value: any): string => {
  return value === 'true' ? 'Ja' : 'Nein';
};

const translationMatrix: { [key: string]: Translation } = {
  date: { name: 'Datum:', valuePipe: dateTransformationPipe },
  registerByDate: { name: 'Anmeldefrist:', valuePipe: dateTransformationPipe },
  mandatory: { name: 'Verpflichtend:', valuePipe: boolTransformation },
  rounds: { name: 'Runden:' },
  hllMap: { name: 'Karte:' },
  commander: { name: 'Kommandant:' },
  moderator: { name: 'Leiter:' },
  duration: { name: 'Dauer:' },
  meetingPoint: { name: 'Treffpunkt:' },
  server: { name: 'Server:' },
  password: { name: 'Passwort:' },
  maxPlayerCount: { name: 'max. Spielerzahl:' },
  briefing: { name: 'Vorbesprechung', valuePipe: dateTransformationPipe },
  faction: { name: 'Seite' },
};

const eventReductor = (acc: [string, any], [key, value]: [string, any]): [string, any] => {
  const translation = translationMatrix[key];
  if (typeof value === 'number') {
    value = value.toString();
  }
  if (value != undefined && translation)
    acc.push([
      translation.name,
      translation.valuePipe ? translation.valuePipe(value as string) : (value as string),
    ]);
  return acc;
};

export class InformationMessage extends DefaultMessage {
  constructor(event: HLLEvent, config: EmbedConfig) {
    super(event, config);
    this.setDescription(event.description)
      .setURL(`${config.baseUrl}events/${event.id}`)
      .setTitle(event.name);
    this.addOptionalFields(event);
  }

  private addOptionalFields(event) {
    const fields = Object.entries(event).reduce(eventReductor, [] as unknown as [string, any]);
    console.log(fields);
    fields.forEach(([key, value]) => {
      console.log(this.addField(key, value, true));
    });
  }
}
