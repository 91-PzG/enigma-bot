import { HttpService, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthDiscordService } from './auth-discord.service';
import { AuthRepository } from './auth.repository';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { DiscordUserDataDto } from './dtos/discord-user-data.dto';
import { JwtWrapperDto } from './dtos/jwt-wrapper.dto';
import { JwtWrapper } from './jwt/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private discordAuthService: AuthDiscordService,
    private httpService: HttpService,
  ) {}

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<JwtWrapperDto> {
    const wrapper = await this.authRepository.signIn(authCredentialsDto);
    return this.generateTokens(wrapper);
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<JwtWrapperDto> {
    const wrapper = await this.authRepository.changePassword(changePasswordDto);
    this.discordAuthService.notifyUserOnPasswordChange(wrapper.accessToken.userId);
    return this.generateTokens(wrapper);
  }

  async discordSignIn(token: string): Promise<JwtWrapperDto> {
    const data: DiscordUserDataDto = (
      await this.httpService
        .get('https://discord.com/api/users/@me', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
        .toPromise()
    ).data;

    if (!data.id) throw new NotFoundException('User not found');

    const wrapper = await this.authRepository.discordSignIn(data.id);
    return this.generateTokens(wrapper);
  }

  private generateTokens(wrapper: JwtWrapper): { accessToken: string } {
    const accessToken = this.jwtService.sign(wrapper.accessToken, {
      expiresIn: '10h',
    });
    return { accessToken };
  }
}
