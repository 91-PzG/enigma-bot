import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtWrapperDto } from '../dtos/jwt-wrapper.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const authServiceMock: Partial<AuthService> = {
      signIn: jest.fn(),
      changePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        AuthController,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signIn', () => {
    it('should call signIn method of service', async () => {
      const accessTokenWrapper: JwtWrapperDto = { accessToken: 'access' };
      authService.signIn.mockResolvedValue(accessTokenWrapper);

      const wrapper = await authController.signIn({
        username: '',
        password: '',
      });

      expect(wrapper).toEqual(accessTokenWrapper);
    });
  });

  describe('changePassword', () => {
    it('should call changePassword method of service', async () => {
      const accessTokenWrapper: JwtWrapperDto = { accessToken: 'access' };
      authService.changePassword.mockResolvedValue(accessTokenWrapper);

      const wrapper = await authController.changePassword({
        username: '',
        newPassword: '',
        oldPassword: '',
      });

      expect(wrapper).toEqual(accessTokenWrapper);
    });
  });
});
