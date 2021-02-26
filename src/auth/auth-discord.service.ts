import { Injectable } from '@nestjs/common';
import { OnCommand } from 'discord-nestjs';
import { Message } from 'discord.js';
import { DiscordService } from '../discord/discord.service';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthDiscordService {
  constructor(
    private authRepository: AuthRepository,
    private discordService: DiscordService,
  ) {}

  @OnCommand({ name: 'start' })
  async signUpOverDiscord(message: Message) {
    if (message.deletable) {
      message.delete();
    }

    const member =
      message.member || (await this.discordService.getMember(message.author));

    if (member && this.discordService.isClanMember(member)) {
      const password = this.generatePassword();

      await this.authRepository
        .setPassword(password, member.id)
        .then(() => {
          message.author.send(
            `Dein neues Passwort lautet: ${password} Bitte ändere dein Passwort beim nächsten Login.`,
          );
        })
        .catch(() => {
          message.author.send(
            `Passwort konnte nicht geändert werden. Bitte kontaktiere einen Administrator.`,
          );
        });
    } else {
      message.author.send(
        'Dieser Befehl steht nur Clanmitgliedern zur Verfügung',
      );
    }
  }

  private generatePassword(): string {
    const length = 20;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.random() * charset.length);
    }
    return password;
  }

  async notifyUserOnPasswordChange(id: string) {
    const user = await this.discordService.getMember(id);
    user?.send(
      "Du hast dein Passwort erfolgreich geändert. Solltest du dein Passwort nicht geändert haben, antworte bitte mit '!passwort' um dein Passwort zurückzusetzen.",
    );
  }
}
