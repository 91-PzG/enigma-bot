import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import jwtDecode from 'jwt-decode';
import { of } from 'rxjs';
import { AccessRoles } from '../../typeorm/entities';
import { AuthRepository } from '../auth.repository';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const authRepositoryMock: Partial<AuthRepository> = {
      signIn: jest.fn(),
    };
    const httpServiceMock: Partial<HttpService> = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'secret' })],
      providers: [
        { provide: AuthRepository, useValue: authRepositoryMock },
        { provide: HttpService, useValue: httpServiceMock },
        AuthService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get(AuthRepository);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    const token = 'token';
    let axiosResponse: AxiosResponse;

    beforeEach(() => {
      axiosResponse = {
        data: {},
        status: 200,
        statusText: 'ok',
        headers: '',
        config: {},
      };
    });

    it('should query discord api', () => {
      expect.assertions(1);

      authService.signIn(token).catch(() => {
        expect(httpService.get).toHaveBeenCalledWith('https://discord.com/api/users/@me', {
          headers: { authorization: 'Bearer ' + token },
        });
      });
    });

    it('should throw exeption if no user is found', () => {
      expect.assertions(1);
      httpService.get.mockReturnValue(of(axiosResponse));
      authService.signIn(token).catch((error) => {
        expect(error).toEqual(new NotFoundException('User not found'));
      });
    });

    it('should return wrapper', async () => {
      axiosResponse.data.id = '8765464';
      httpService.get.mockReturnValue(of(axiosResponse));

      const jwtData = { userId: '8765464', username: 'Hans', roles: [AccessRoles.GUEST] };
      authRepository.signIn.mockResolvedValue({ accessToken: jwtData });

      const jwt = await authService.signIn(token);
      expect(jwtDecode(jwt.accessToken)).toMatchObject(jwtData);
    });
  });
});
