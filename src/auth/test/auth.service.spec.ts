import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from '../auth.repository';
import { AuthService } from '../auth.service';
import { DiscordAuthService } from '../discord-auth.service';
import { JwtWrapper } from '../jwt/jwt-payload.interface';

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let discordAuthService: jest.Mocked<DiscordAuthService>;

  const signedMock: string = 'Test';

  beforeEach(async () => {
    const authRepositoryMock: Partial<AuthRepository> = {
      signIn: jest.fn(),
      changePassword: jest.fn(),
    };
    const jwtServiceMock: Partial<JwtService> = {
      sign: jest.fn(),
    };
    const discordAuthServiceMock: Partial<DiscordAuthService> = {
      notifyUserOnPasswordChange: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AuthRepository, useValue: authRepositoryMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: DiscordAuthService, useValue: discordAuthServiceMock },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get(AuthRepository);
    jwtService = module.get(JwtService);
    discordAuthService = module.get(DiscordAuthService);

    jwtService.sign.mockReturnValue(signedMock);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should call signIn method of service', async () => {
      const jwtWrapper: JwtWrapper = {
        accessToken: {
          userId: 'string',
          username: 'string',
          roles: [],
          avatar: 'string',
        },
      };
      authRepository.signIn.mockResolvedValue(jwtWrapper);

      const wrapperDto = await authService.signIn({
        username: '',
        password: '',
      });

      expect(wrapperDto).toEqual({ accessToken: signedMock });
    });
  });

  describe('changePassword', () => {
    it('should call changePassword method of service', async () => {
      const jwtWrapper: JwtWrapper = {
        accessToken: {
          userId: 'userId',
          username: 'string',
          roles: [],
          avatar: 'string',
        },
      };
      authRepository.changePassword.mockResolvedValue(jwtWrapper);

      const wrapper = await authService.changePassword({
        username: '',
        oldPassword: '',
        newPassword: '',
      });

      expect(wrapper).toEqual({ accessToken: signedMock });
      expect(discordAuthService.notifyUserOnPasswordChange).toBeCalledWith(
        'userId',
      );
    });
  });
});
