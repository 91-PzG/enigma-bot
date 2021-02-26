import { Test, TestingModule } from '@nestjs/testing';
import { GuildMember, Message } from 'discord.js';
import { DiscordService } from '../../discord/discord.service';
import { AuthDiscordService } from '../auth-discord.service';
import { AuthRepository } from '../auth.repository';

describe('AuthService', () => {
  let discordAuthService: AuthDiscordService;
  let authRepository: jest.Mocked<AuthRepository>;
  let discordService: jest.Mocked<DiscordService>;
  let member: Partial<GuildMember>;

  beforeEach(async () => {
    const authRepositoryMock: Partial<AuthRepository> = {
      setPassword: jest.fn(),
    };
    const discordServiceMock: Partial<DiscordService> = {
      getMember: jest.fn(),
      isClanMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AuthRepository, useValue: authRepositoryMock },
        { provide: DiscordService, useValue: discordServiceMock },
        AuthDiscordService,
      ],
    }).compile();

    discordAuthService = module.get<AuthDiscordService>(AuthDiscordService);
    authRepository = module.get(AuthRepository);
    discordService = module.get(DiscordService);

    //@ts-ignore
    member = {
      send: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(discordAuthService).toBeDefined();
  });

  describe('notifyUserOnPasswordChange', () => {
    it('should send notification to user', async () => {
      discordService.getMember.mockResolvedValue(member as GuildMember);

      await discordAuthService.notifyUserOnPasswordChange('');
      expect(member.send).toHaveBeenCalledWith(
        "Du hast dein Passwort erfolgreich geändert. Solltest du dein Passwort nicht geändert haben, antworte bitte mit '!passwort' um dein Passwort zurückzusetzen.",
      );
    });

    //stupid test to bring branch coverage to 100%
    it('should not send notification to user if user is undefinded', async () => {
      discordService.getMember.mockReturnValue(undefined);
      await discordAuthService.notifyUserOnPasswordChange('');
    });
  });

  describe('signUpOverDiscord', () => {
    let message: Partial<Message>;
    beforeEach(() => {
      //@ts-ignore
      message = {
        deletable: true,
        delete: jest.fn(),
        //@ts-ignore
        author: {
          send: jest.fn(),
        },
      };
    });

    it('should try to delete message', async () => {
      await discordAuthService.signUpOverDiscord(message as Message);
      expect(message.delete).toHaveBeenCalled();
    });

    it('should not try to delete message if not deletable', async () => {
      //@ts-ignore
      message.deletable = false;
      await discordAuthService.signUpOverDiscord(message as Message);
      expect(message.delete).not.toHaveBeenCalled();
    });

    it('should send error message if user is not a clan member', async () => {
      discordService.getMember = jest.fn().mockResolvedValue('hans');
      discordService.isClanMember = jest.fn().mockReturnValue(false);

      await discordAuthService.signUpOverDiscord(message as Message);
      expect(message.author?.send).toHaveBeenCalledWith(
        'Dieser Befehl steht nur Clanmitgliedern zur Verfügung',
      );

      //@ts-ignore
      message.member = true;
      await discordAuthService.signUpOverDiscord(message as Message);
      expect(message.author?.send).toHaveBeenCalledWith(
        'Dieser Befehl steht nur Clanmitgliedern zur Verfügung',
      );
    });

    it('should send error message if set password fails', async () => {
      //@ts-ignore
      message.member = 'hans';
      discordService.isClanMember = jest.fn().mockReturnValue(true);
      authRepository.setPassword = jest.fn().mockRejectedValue('');

      await discordAuthService.signUpOverDiscord(message as Message);
      expect(message.author?.send).toHaveBeenCalledWith(
        'Passwort konnte nicht geändert werden. Bitte kontaktiere einen Administrator.',
      );
    });

    it('should send confirmation message if set password resolves', async () => {
      //@ts-ignore
      message.member = 'hans';
      discordService.isClanMember = jest.fn().mockReturnValue(true);
      authRepository.setPassword = jest.fn().mockResolvedValue('');

      const password = 'Pa$$w0rd';
      jest
        .spyOn(AuthDiscordService.prototype as any, 'generatePassword')
        .mockReturnValue(password);

      await discordAuthService.signUpOverDiscord(message as Message);
      expect(message.author?.send).toHaveBeenCalledWith(
        `Dein neues Passwort lautet: ${password} Bitte ändere dein Passwort beim nächsten Login.`,
      );
    });
  });
});
