import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnCommand } from 'discord-nestjs';
import { GuildMember, Message } from 'discord.js';
import { Repository } from 'typeorm';
import { Member } from '../../postgres/entities';
import { DiscordService } from '../discord.service';
import { DiscordUtil } from '../util/discord.util';

@Injectable()
export class UpdateUsersCommand {
  constructor(
    private discordService: DiscordService,
    @InjectRepository(Member)
    private repository: Repository<Member>,
    private util: DiscordUtil,
  ) {}

  @OnCommand({ name: 'update' })
  async updateUsersCommand(message: Message): Promise<void> {
    if (message.deletable) message.delete();
    message.channel.send('Updating all users...').then((msg) => msg.delete({ timeout: 5000 }));

    const users = await this.discordService.getClanMembers();
    users.forEach((user) => this.updateUser(user));
  }

  private async updateUser(user: GuildMember) {
    let member = await this.repository.findOne(user.id);
    if (!member) member = await this.util.createMember(user);

    this.util.updateMember(user, member);
  }
}
