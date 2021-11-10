import { On, UseGuards } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { query, QueryResult } from 'gamedig';
import { EmbedConfig } from '../../config/embeds.config';
import { ServerConfig } from '../../config/server.config';
import { DiscordService } from '../../discord/discord.service';
import { MaprecorderGuard } from './maprecorder.guard';
import { mapRegistry } from './mapregistry';

@Injectable()
export class ServerService {
  startup = true;
  messages: Message[];
  channel: TextChannel;
  logger = new Logger('Server Status');
  serverConfig: ServerConfig;
  embedConfig: EmbedConfig;
  mapTimestamps: number[] = [];

  constructor(private discordService: DiscordService, config: ConfigService) {
    this.embedConfig = config.get('embed');
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

  @On('messageCreate')
  @UseGuards(MaprecorderGuard)
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
        this.messages.push(await this.channel.send({ embeds: [embed] }));
      } catch (e) {
        this.logger.log(e);
        error = true;
      }
    }

    this.startup = error;
  }

  private async editMessages(embeds: MessageEmbed[]) {
    let error = false;
    for (let i = 0; i < embeds.length; i++) {
      try {
        this.messages[i] = await this.messages[i].edit({ embeds: [embeds[i]] });
      } catch (e) {
        this.logger.log(e);
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
    const map = mapRegistry[state.map];
    const embed = new MessageEmbed()
      .setColor(this.embedConfig.color)
      .setTitle(state.name)
      .setURL(this.embedConfig.baseUrl)
      .setThumbnail(this.embedConfig.thumbnail)
      .addField('Players', `${Math.min(state.players.length, 100)}/100`)
      .addField('Queue', `${Math.max(state.players.length - 100, 0)}/6`)
      .addField(
        'Clanmembers',
        `${state.players.filter((f) => f.name != null && f.name.startsWith('91.')).length}/${
          state.players.length
        }`,
      )
      .addField('Ping', state.ping.toString())
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
      .setColor(this.embedConfig.color)
      .setTitle(this.serverConfig.servers[index].name)
      .setDescription('Server request timed out')
      .setURL(this.embedConfig.baseUrl)
      .setThumbnail(this.embedConfig.thumbnail)
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
