import { Module } from '@nestjs/common';
import { ConfigFactory, ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { OptionalAuthGuard } from './auth/jwt/guards/optional-auth.guard';
import { ChannelsModule } from './channels/channels.module';
import databaseConfig from './config/database.config';
import discordConfig from './config/discord.config';
import embedsConfig from './config/embeds.config';
import jwtConfig from './config/jwt.config';
import serverConfig from './config/server.config';
import { DiscordModule } from './discord/discord.module';
import { EnrolmentsModule } from './enrolments/enrolments.module';
import { HLLEventModule } from './hllevents/hllevent.module';
import { UsersModule } from './users/users.module';

const CONFIG: ConfigFactory<any>[] = [
  databaseConfig,
  discordConfig,
  jwtConfig,
  embedsConfig,
  serverConfig,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      load: CONFIG,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (service: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        entities: [__dirname + '/**/*.{entity,view}.ts'],
        host: service.get('database.host'),
        port: service.get('database.port'),
        username: service.get('database.username'),
        password: service.get('database.password'),
        synchronize: service.get('database.synchronize'),
        database: service.get('database.database'),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    DiscordModule,
    HLLEventModule,
    UsersModule,
    ChannelsModule,
    EnrolmentsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: OptionalAuthGuard }],
})
export class AppModule {}
