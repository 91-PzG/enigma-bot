import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { query, QueryResult } from 'gamedig';
import { ServerConfig } from '../../config/server.config';
import { DiscordService } from '../discord.service';

class mapType {
  [key: string]: { name: string; imageUrl: string };
}

const mapRegistry: mapType = {
  ct: {
    name: 'Carentan',
    imageUrl: 'https://pbs.twimg.com/media/Ebc4mugXQAM4UcL.jpg',
  },
  foy: {
    name: 'Foy',
    imageUrl:
      'https://vignette.wikia.nocookie.net/hellletloose/images/e/eb/Foy_1.jpg/revision/latest?cb=20200408233012',
  },
  hil: {
    name: 'Hill 400',
    imageUrl:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/clans/34012997/96f6c508ef387970e14a7a8c35d969ed3708e28a.jpg',
  },
  hur: {
    name: 'Hurtgen Forest',
    imageUrl: 'https://pbs.twimg.com/media/DLGGtLEVYAAiFc4.jpg',
  },
  oma: {
    name: 'Omaha Beach',
    imageUrl:
      'https://www.gaming-grounds.de/wp-content/uploads/2019/09/hell-let-loose-ww2-omaha-beach-15.jpg',
  },
  phl: {
    name: 'Purple Heart Lane',
    imageUrl: 'https://www.histogames.com/images/news/janvier2020/025/image-2.jpg',
  },
  sme: {
    name: 'Sainte-Mère-Église',
    imageUrl:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/clans/34012997/ecbfb3ec24ffbcd357b97234909321b58ee7a902.jpg',
  },
  stm: {
    name: 'Sainte-Marie-du-Mont',
    imageUrl:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/clans/34012997/4870efac69f55b1bfc5240c5587be4848ea46ff1.png',
  },
  uta: {
    name: 'Utah Beach',
    imageUrl:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/clans/34012997/2e83730396d8e071392791f0147563dd6e5026f2.jpg',
  },
};

@Injectable()
export class ServerService {
  startup = true;
  msg1: Message;
  msg2: Message;
  channel: TextChannel;
  thumbnail: string;
  logger = new Logger('Server Status');
  serverConfig: ServerConfig;

  constructor(private discordService: DiscordService, config: ConfigService) {
    this.thumbnail = config.get('embed').thumbnail;
    this.serverConfig = config.get('server');
  }

  @Cron('*/30 * * * * *')
  async generateServerMessages() {
    const embed1 = this.generateEmbed(1);
    const embed2 = this.generateEmbed(2);

    if (this.startup) {
      this.channel = await this.discordService.getChannelById<TextChannel>(
        this.serverConfig.channel,
      );
      this.createMessages(embed1, embed2);
    } else {
      this.editMessages(embed1, embed2);
    }
  }

  private async createMessages(embed1: Promise<MessageEmbed>, embed2: Promise<MessageEmbed>) {
    await this.discordService.clearChannel(this.channel);
    try {
      await this.channel.send(await embed1).then((msg) => (this.msg1 = msg));
      await this.channel.send(await embed2).then((msg) => (this.msg2 = msg));
    } catch (error) {
      this.logger.log(error);
    }
    this.startup = false;
  }

  private async editMessages(embed1: Promise<MessageEmbed>, embed2: Promise<MessageEmbed>) {
    try {
      this.msg1.edit(await embed1);
      this.msg2.edit(await embed2);
    } catch (error) {
      this.startup = true;
      this.logger.log(error);
    }
  }

  private async generateEmbed(server: number): Promise<MessageEmbed> {
    let state = await this.serverQuery(server);
    if (state == null) return;

    const map = mapRegistry[state.map.substring(0, 3).toLowerCase()];

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(state.name)
      .setURL('https://91pzg.de/')
      .setThumbnail(this.thumbnail)
      .addField('Players', `${Math.min(state.players.length, 100)}/100`)
      .addField('Queue', `${Math.max(state.players.length - 100, 0)}/6`)
      .addField(
        'Clanmember',
        `${state.players.filter((f) => f.name != null && f.name.startsWith('91.')).length}/${
          state.players.length
        }`,
      )
      .addField('Ping', state.ping)
      //@ts-ignore
      .addField('IP', state.connect)
      //@ts-ignore
      .addField('version', state.raw.version)
      .addField('Map', map.name)
      .setImage(map.imageUrl)
      .setTimestamp();

    return embed;
  }

  private async serverQuery(server: number): Promise<QueryResult> {
    try {
      return await query(server === 1 ? this.serverConfig.server1 : this.serverConfig.server2);
    } catch (error) {
      this.logger.log(error);
      return null;
    }
  }
}
