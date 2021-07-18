import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { OnCommand } from 'discord-nestjs';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { query, QueryResult } from 'gamedig';
import { ServerConfig } from '../../config/server.config';
import { DiscordService } from '../discord.service';

class mapType {
  [key: string]: { name: string; imageUrl: string };
}

export const mapRegistry: mapType = {
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
  messages: Message[];
  channel: TextChannel;
  thumbnail: string;
  logger = new Logger('Server Status');
  serverConfig: ServerConfig;
  mapTimestamps: number[] = [];

  constructor(private discordService: DiscordService, config: ConfigService) {
    this.thumbnail = config.get('embed').thumbnail;
    this.serverConfig = config.get('server');
  }

  @Cron('*/30 * * * * *')
  async generateServerMessages() {
    const serverStates: QueryResult[] = await Promise.all(this.queryServers());
    const embeds = this.generateEmbeds(serverStates);

    if (this.startup) {
      this.channel = await this.discordService.getChannelById<TextChannel>(
        this.serverConfig.channel,
      );
      return this.createMessages(embeds);
    } else {
      return this.editMessages(embeds);
    }
  }

  @OnCommand({
    name: 'Server',
    prefix: '[',
    allowChannels: process.env.SERVER_LOG ? [process.env.SERVER_LOG] : [],
  })
  updateMapRuntime(message: Message) {
    if (!message.content.includes('MAP_RECORDER') || message.content.endsWith('_RESTART``')) return;

    this.mapTimestamps[2 - parseInt(message.content[9])] = ~~(Date.now() / 60000);
  }

  private async createMessages(embeds: MessageEmbed[]) {
    await this.discordService.clearChannel(this.channel);
    this.messages = [];
    let error = false;

    for (const embed of embeds) {
      try {
        this.messages.push(await this.channel.send(embed));
      } catch (error) {
        this.logger.log(error);
        error = true;
      }
    }

    this.startup = error;
  }

  private async editMessages(embeds: MessageEmbed[]) {
    let error = false;
    for (let i = 0; i < embeds.length; i++) {
      try {
        this.messages[i] = await this.messages[i].edit(embeds[i]);
      } catch (error) {
        this.logger.log(error);
        error = true;
      }
    }
    this.startup = error;
  }

  private generateEmbeds(serverStates: QueryResult[]): MessageEmbed[] {
    const embeds: MessageEmbed[] = [];
    for (let i = 0; i < this.serverConfig.servers.length; i++) {
      const serverState = serverStates[i];
      embeds.push(
        serverState ? this.generateServerEmbed(serverState, i) : this.generateErrorEmbed(i),
      );
    }
    return embeds;
  }

  private generateServerEmbed(state: QueryResult, index: number): MessageEmbed {
    const map = mapRegistry[state.map.substring(0, 3).toLowerCase()];
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(state.name)
      .setURL('https://91pzg.de/')
      .setThumbnail(this.thumbnail)
      .addField('Players', `${Math.min(state.players.length, 100)}/100`)
      .addField('Queue', `${Math.max(state.players.length - 100, 0)}/6`)
      .addField(
        'Clanmembers',
        `${state.players.filter((f) => f.name != null && f.name.startsWith('91.')).length}/${
          state.players.length
        }`,
      )
      .addField('Ping', state.ping)
      .addField('Socket', state.connect)
      .addField('Password', state.password ? 'Yes' : 'No')
      .addField('Map', map.name)
      .setImage(map.imageUrl)
      .setTimestamp();
    if (this.mapTimestamps[index]) {
      const timeToEnd = 90 - (~~(Date.now() / 60000) - this.mapTimestamps[index]);
      embed.addField('Remaining Time', `${~~(timeToEnd / 60)}h ${~~(timeToEnd % 60)}min`);
    }
    return embed;
  }

  private generateErrorEmbed(index: number): MessageEmbed {
    return new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(this.serverConfig.servers[index].name)
      .setDescription('Server request timed out')
      .setURL('https://91pzg.de/')
      .setThumbnail(this.thumbnail)
      .setTimestamp();
  }

  private queryServers(): Promise<QueryResult>[] {
    const serverStates: Promise<QueryResult>[] = [];
    for (let i = 0; i < this.serverConfig.servers.length; i++) {
      const server = this.serverConfig.servers[i];
      const statePromise = new Promise<QueryResult>(async (resolve) => {
        try {
          resolve(await query(server));
        } catch (error) {
          this.logger.log(error);
          resolve(null);
        }
      });
      serverStates[i] = statePromise;
    }
    return serverStates;
  }
}
