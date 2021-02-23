import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { JwtWrapperDto } from './dtos/jwt-wrapper.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signin')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<JwtWrapperDto> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Post('/password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<JwtWrapperDto> {
    return this.authService.changePassword(changePasswordDto);
  }
}
