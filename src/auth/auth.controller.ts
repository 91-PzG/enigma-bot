import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/discord')
  signIn(@Query('token') discordToken: string) {
    return this.authService.signIn(discordToken);
  }
}
