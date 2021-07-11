import { EmbedConfig } from '../../../config/embeds.config';
import { HLLEvent } from '../../../postgres/entities';
import { DefaultMessage } from './default.message';

type Translation = {
  name: string;
  valuePipe?: (value: any) => string;
};

const msInTwoHours = 1000 * 60 * 60 * 2;

const days = ['So, ', 'Mo, ', 'Di, ', 'Mi, ', 'Do, ', 'Fr, ', 'Sa, '];

const zeroPad = (num) => String(num).padStart(2, '0');

const dateTransformation = (value: any): string => {
  let date = new Date(value);
  date = new Date(date.getTime() + msInTwoHours);

  return `${days[date.getDay()]}${date.getDate()}.${date.getMonth() + 1}.${
    date.getFullYear() % 100
  } ${zeroPad(date.getHours())}:${zeroPad(date.getMinutes())}`;
};

const boolTransformation = (value: any): string => {
  return value === 'true' ? 'Ja' : 'Nein';
};

const translationMatrix: { [key: string]: Translation } = {
  date: { name: 'Datum:', valuePipe: dateTransformation },
  registerByDate: { name: 'Anmeldefrist:', valuePipe: dateTransformation },
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
  briefing: { name: 'Vorbesprechung', valuePipe: dateTransformation },
  faction: { name: 'Seite' },
};

const eventReductor = (acc: [string, any], [key, value]: [string, any]): [string, any] => {
  const translation = translationMatrix[key];
  if (value != undefined && translation)
    acc.push([translation.name, translation.valuePipe ? translation.valuePipe(value) : value]);
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
