import { DiscordModule as NestDiscordModule } from '@discord-nestjs/core';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Intents } from 'discord.js';
import { BotModule } from '../bot/bot.module';
import { Contact, Member } from '../typeorm/entities';
import { DiscordService } from './discord.service';
import { MessageModule } from './messages/message.module';
import { DiscordUtil } from './util/discord.util';

@Global()
@Module({
  imports: [
    NestDiscordModule.forRootAsync({
      imports: [ConfigModule, BotModule],
      useFactory: (service: ConfigService) => ({
        token: service.get('discord.token'),
        commands: ['**/*.command.js'],
        discordClientOptions: {
          intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
          ],
        },
        registerCommandOptions: [
          {
            forGuild: service.get('discord.guild'),
          },
        ],
      }),

      inject: [ConfigService],
    }),
    MessageModule,
    ConfigModule,
    TypeOrmModule.forFeature([Contact, Member]),
  ],
  providers: [DiscordService, DiscordUtil],
  exports: [DiscordService, DiscordUtil, MessageModule],
})
export class DiscordModule {}
