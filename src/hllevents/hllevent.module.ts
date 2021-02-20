import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HLLEventEntity } from '../entities';
import { UsersModule } from '../users/users.module';
import { HLLEventController } from './hllevent.controller';
import { HLLEventService } from './hllevent.service';

@Module({
  imports: [TypeOrmModule.forFeature([HLLEventEntity]), UsersModule],
  controllers: [HLLEventController],
  providers: [HLLEventService],
})
export class HLLEventModule {}
