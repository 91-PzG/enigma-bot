import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HLLEvent } from '../entities';
import { UsersModule } from '../users/users.module';
import { HLLEventController } from './hllevent.controller';
import { HLLEventService } from './hllevent.service';

@Module({
  imports: [TypeOrmModule.forFeature([HLLEvent]), UsersModule],
  controllers: [HLLEventController],
  providers: [HLLEventService],
})
export class HLLEventModule {}
