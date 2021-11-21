import { TransformPipe } from '@discord-nestjs/common';
import { Command, DiscordTransformedCommand, Payload, UsePipes } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandInteraction, GuildMember } from 'discord.js';
import { Repository } from 'typeorm';
import { DiscordService } from '../../discord/discord.service';
import { Member } from '../../typeorm/entities';
import { SteamnameDto } from './dto/steamname.dto';

@Command({
  name: 'steamname',
  description: 'Updated deinen Steam-Nutzernamen',
})
@UsePipes(TransformPipe)
export class SteamnameCommand implements DiscordTransformedCommand<SteamnameDto> {
  logger = new Logger('Steamname');

  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    private service: DiscordService,
  ) {}

  async handler(@Payload() dto: SteamnameDto, interaction: CommandInteraction): Promise<void> {
    const isMember = this.service.isClanMember(interaction.member as GuildMember);
    if (!isMember)
      return interaction.reply({ content: 'Du bist kein Clanmember', ephemeral: true });

    const updateResult = await this.memberRepository.update(interaction.user.id, {
      steamName: dto.name,
    });
    if (updateResult.affected > 0) {
      return interaction.reply({
        content: 'Du hast erfolgreich deinen Steamnamen eingetragen.\nVielen Dank!',
        ephemeral: true,
      });
    }
    interaction.reply({
      content: 'Fehler beim Updaten des Steamnamens.\nBitte versuche es später erneut.',
      ephemeral: true,
    });
  }
}
