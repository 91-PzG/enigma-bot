import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnCommand } from 'discord-nestjs';
import { GuildMember, Message } from 'discord.js';
import { DiscordConfig } from '../../config/discord.config';
import { Contact, Member, Rank } from '../../postgres/entities';
import { DiscordService } from '../discord.service';
import { DiscordUtil } from '../util/discord.util';
import { MemberRepository } from '../util/member.repository';

@Injectable()
export class UpdateUsersCommand {
  config: DiscordConfig;
  constructor(
    private discordService: DiscordService,
    private repository: MemberRepository,
    private util: DiscordUtil,
    config: ConfigService,
  ) {
    this.config = config.get('discord');
  }

  @OnCommand({ name: 'update' })
  async updateUsersCommand(message: Message): Promise<void> {
    if (message.deletable) message.delete();
    message.channel.send('Updating all users...').then((msg) => msg.delete({ timeout: 5000 }));

    const users = await this.discordService.getClanMembers();
    users.forEach((user) => this.updateUser(user));
  }

  private async updateUser(user: GuildMember) {
    let member = await this.repository.findOne(user.id);
    if (!member) member = await this.createMember(user);

    this.updateMember(user, member);
  }

  private async createMember(user: GuildMember): Promise<Member> {
    const member = new Member();
    member.id = user.id;
    if (user.roles.cache.has(this.config.recruitRole)) {
      member.recruitSince = new Date();
      member.rank = Rank.RECRUIT;
    } else {
      member.memberSince = new Date();
    }

    member.contact = await this.createContact(user);

    return member;
  }

  private async updateMember(user: GuildMember, member: Member) {
    member.reserve = user.roles.cache.has(this.config.reserveRole);
    member.avatar = user.user.avatarURL();
    member.division = this.util.getDivision(user.roles.cache);
    member.rank = this.util.getRank(user.roles.cache);
    member.contactId = user.id;

    if (member.rank != 'recruit' && !member.memberSince) {
      member.recruitTill = new Date();
      member.memberSince = new Date();
    }

    member.contact.name = user.displayName;
    member.contact.save();

    member.save();
  }

  private createContact(user: GuildMember): Promise<Contact> {
    const contact = new Contact();
    contact.id = user.id;
    contact.name = user.displayName;
    return contact.save();
  }
}
