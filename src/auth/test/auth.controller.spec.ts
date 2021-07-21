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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }, AuthController],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signIn', () => {
    it('should call authService signIn with correct values', () => {
      const token = 'asdzfasf';
      authController.signIn(token);
      expect(authService.signIn).toHaveBeenLastCalledWith(token);
    });

    it('should return value returned from service', () => {
      expect.assertions(1);
      const wrapper: JwtWrapperDto = {
        accessToken: 'access',
      };
      authService.signIn.mockResolvedValue(wrapper);
      authController.signIn('abc').then((value) => {
        expect(value).toEqual(wrapper);
      });
    });
  });
});
