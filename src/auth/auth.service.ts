import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { AuthRepository } from './auth.repository';
import { DiscordUserDataDto } from './dtos/discord-user-data.dto';
import { JwtWrapperDto } from './dtos/jwt-wrapper.dto';
import { JwtWrapper } from './jwt/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  async signIn(token: string): Promise<JwtWrapperDto> {
    const data: DiscordUserDataDto = (
      await firstValueFrom(
        this.httpService.get('https://discord.com/api/users/@me', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      )
    ).data;

    if (!data.id) throw new NotFoundException('User not found');

    const wrapper = await this.authRepository.signIn(data.id);
    return this.generateTokens(wrapper);
  }

  private generateTokens(wrapper: JwtWrapper): { accessToken: string } {
    const accessToken = this.jwtService.sign(wrapper.accessToken, {
      expiresIn: '10h',
    });
    return { accessToken };
  }
}
