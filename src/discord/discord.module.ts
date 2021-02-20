import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord.service';

@Global()
@Module({imports:[ConfigModule],providers:[DiscordService],exports:[DiscordService]})
export class DiscordModule {}
