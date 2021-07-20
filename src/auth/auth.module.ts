import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../postgres/entities';
import { AuthDiscordService } from './auth-discord.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
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
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthDiscordService, JwtUserStrategy],
  exports: [PassportModule, JwtUserStrategy],
})
export class AuthModule {}
