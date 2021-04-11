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
    if (this.util.isClanMember(oldMember.roles.cache)) {
      const member = await this.repository.findOne(newMember.id);

      if (!this.util.isClanMember(newMember.roles.cache)) member.memberTill = new Date();

      this.util.updateMember(newMember, member);
    } else if (this.util.isClanMember(newMember.roles.cache)) {
      this.util.updateMember(newMember, await this.util.createMember(newMember));
    }
  }
}
