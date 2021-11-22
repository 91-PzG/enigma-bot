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

    if (dto.name) {
      this.setSteamname(interaction, dto.name);
    } else {
      this.printSteamname(interaction);
    }
  }

  async setSteamname(interaction: CommandInteraction, name: string) {
    const updateResult = await this.memberRepository.update(interaction.user.id, {
      steamName: name,
    });

    if (updateResult.affected > 0) {
      this.reply(interaction, 'Du hast erfolgreich deinen Steamnamen eingetragen.\nVielen Dank!');
    } else {
      this.reply(
        interaction,
        'Fehler beim Updaten des Steamnamens.\nBitte versuche es später erneut.',
      );
    }
  }

  async printSteamname(interaction: CommandInteraction) {
    const member = await this.memberRepository.findOne(interaction.user.id);

    if (member.steamName) {
      this.reply(interaction, `Du hast \`${member.steamName}\` als Steamname eingespeichert.`);
    } else {
      this.reply(interaction, 'Du hast noch keinen Steamnamen eingespeichert.');
    }
  }

  reply(interaction: CommandInteraction, content: string) {
    interaction.reply({ content, ephemeral: true });
  }
}
