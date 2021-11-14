import { DiscordClientProvider, Once } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CategoryChannel,
  Channel,
  Client,
  Collection,
  Guild,
  GuildEmoji,
  GuildMember,
  Message,
  Role,
  TextChannel,
  User,
} from 'discord.js';
import { DiscordChannelDto } from '../channels/dtos/discord-channel.dto';
import { DiscordConfig } from '../config/discord.config';

@Injectable()
export class DiscordService {
  client: Client;
  private config: DiscordConfig;
  private logger = new Logger('DiscordService');

  constructor(config: ConfigService, private discordProvider: DiscordClientProvider) {
    this.config = config.get('discord');
  }

  @Once('ready')
  onReady(): void {
    this.client = this.discordProvider.getClient();
    this.logger.log('Discord client connected');
  }

  async getClanMembers(): Promise<Collection<string, GuildMember>> {
    const channel = await this.getChannelById<TextChannel>(this.config.clanChat);
    return channel.members.filter((member) => !member.user.bot);
  }

  getEventChannels(): DiscordChannelDto[] {
    return this.client.channels.cache
      .filter(
        (f) => f.type === 'GUILD_TEXT' && (f as TextChannel).parentId === this.config.eventCategory,
      )
      .map((channel) => ({
        id: channel.id,
        name: (channel as TextChannel).name,
      }));
  }

  async getChannelById<T extends Channel>(id: string): Promise<T> {
    try {
      return (await this.client.channels.fetch(id)) as T;
    } catch (error) {
      return undefined;
    }
  }

  async getMessageById(
    messageId: string,
    channelId: string,
    force?: boolean,
  ): Promise<Message | undefined> {
    const channel = await this.getChannelById<TextChannel>(channelId);
    if (!channel) return undefined;
    return channel.messages.fetch(messageId, { force });
  }

  getEmojiById(emojiId: string): Promise<GuildEmoji> | undefined {
    return this.getGuild().emojis.fetch(emojiId);
  }

  getGuild(): Guild | undefined {
    return this.client.guilds.cache.get(this.config.guild);
  }

  getMember(user: User | string): Promise<GuildMember> | undefined {
    return this.getGuild()?.members.fetch(user);
  }

  async createEventChannelIfNotExists(name: string): Promise<TextChannel> {
    let id: string = '';
    this.getEventChannels().forEach((c) => {
      if (c.name == name.toLowerCase()) id = c.id;
    });
    if (id != '') return this.getChannelById(id);

    const guild = this.getGuild();
    if (!guild) throw Error('could not find guild');

    return guild.channels.create(name, {
      type: 'GUILD_TEXT',
      parent: await this.getChannelById<CategoryChannel>(this.config.eventCategory),
    });
  }

  async getRoleById(id: string): Promise<Role | undefined> {
    return this.getGuild()?.roles.fetch(id);
  }

  async clearChannel(channel: TextChannel) {
    const messages = await channel.messages.fetch();
    try {
      await channel.bulkDelete(messages);
    } catch (error) {}
  }

  isClanMember(member: GuildMember): boolean {
    return member.roles.cache.has(this.config.memberRole);
  }
}
