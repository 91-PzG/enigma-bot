import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule as DiscordConfigModule } from 'discord-nestjs';
import { AuthModule } from './auth/auth.module';
import { OptionalAuthGuard } from './auth/jwt/guards/optional-auth.guard';
import { ChannelsModule } from './channels/channels.module';
import databaseConfig from './config/database.config';
import discordConfig from './config/discord.config';
import jwtConfig from './config/jwt.config';
import { DiscordModule } from './discord/discord.module';
import { HLLEventModule } from './hllevents/hllevent.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, discordConfig, jwtConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (service: ConfigService) => ({
        type: 'postgres',
        host: service.get('database.host'),
        port: service.get('database.port'),
        username: service.get('database.username'),
        password: service.get('database.password'),
        database: 'enigmabot',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    DiscordConfigModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (service: ConfigService) => ({
        token: service.get('discord.token') as string,
        commandPrefix: service.get('discord.prefix') as string,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    DiscordModule,
    HLLEventModule,
    UsersModule,
    ChannelsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: OptionalAuthGuard }],
})
export class AppModule {}
