import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../typeorm/entities';
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
  providers: [AuthService, JwtUserStrategy],
  exports: [PassportModule, JwtUserStrategy],
})
export class AuthModule {}
