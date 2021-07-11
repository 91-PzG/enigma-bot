import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { On } from 'discord-nestjs';
import { GuildMember } from 'discord.js';
import { Repository } from 'typeorm';
import { Member } from '../../postgres/entities';
import { DiscordUtil } from '../util/discord.util';

@Injectable()
export class GuildMemberUpdate {
  constructor(
    @InjectRepository(Member)
    private repository: Repository<Member>,
    private util: DiscordUtil,
  ) {}

  @On({ event: 'guildMemberUpdate' })
  async guildMemberUpdate(oldMember: GuildMember, newMember: GuildMember) {
    let member: Member;
    if (this.util.isClanMember(oldMember.roles.cache)) {
      member = await this.updateExistingMember(newMember);
    } else if (this.util.isClanMember(newMember.roles.cache)) {
      member = await this.util.createMember(newMember);
    } else return;

    this.util.updateMember(newMember, member);
  }

  private async updateExistingMember(newMember: GuildMember): Promise<Member> {
    const member = await this.repository.findOne(newMember.id);

    if (!member) return this.util.createMember(newMember);

    if (!this.util.isClanMember(newMember.roles.cache)) member.memberTill = new Date();

    return member;
  }
}
