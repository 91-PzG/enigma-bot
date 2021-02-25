import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../entities';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { DiscordAuthService } from './discord-auth.service';
import { JwtUserStrategy } from './jwt/jwt-user.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (service: ConfigService) => ({
        secret: service.get('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Member, AuthRepository]),
  ],
  controllers: [AuthController],
  providers: [AuthService, DiscordAuthService, JwtUserStrategy],
  exports: [PassportModule, JwtUserStrategy],
})
export class AuthModule {}
