import { TransformPipe } from '@discord-nestjs/common';
import { Command, DiscordCommand, UsePipes } from '@discord-nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandInteraction, GuildMember } from 'discord.js';
import { Repository } from 'typeorm';
import { DiscordService } from '../../discord/discord.service';
import { DiscordUtil } from '../../discord/util/discord.util';
import { Member } from '../../typeorm/entities';

@Command({
  name: 'updateusers',
  description: 'Updates every clanmembers entry in the database',
})
@UsePipes(TransformPipe)
export class UpdateUsersCommand implements DiscordCommand {
  constructor(
    private discordService: DiscordService,
    @InjectRepository(Member)
    private repository: Repository<Member>,
    private util: DiscordUtil,
  ) {}

  async handler(interaction: CommandInteraction): Promise<void> {
    interaction.reply({
      content: 'Updating clanmembers...',
      ephemeral: true,
    });

    const users = await this.discordService.getClanMembers();
    users.forEach((user) => this.updateUser(user));
    interaction.followUp({ content: 'Successfully updated clanmembers', ephemeral: true });
  }

  private async updateUser(user: GuildMember) {
    let member = await this.repository.findOne(user.id);
    if (!member) member = await this.util.createMember(user);

    this.util.updateMember(user, member);
  }
}
