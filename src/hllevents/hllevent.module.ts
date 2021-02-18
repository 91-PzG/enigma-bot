import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HllEventEntity } from '../entities';
import { HllEventController } from './hllevent.controller';
import { HllEventService } from './hllevent.service';

@Module({
  imports: [TypeOrmModule.forFeature([HllEventEntity])],
  controllers: [HllEventController],
  providers: [HllEventService],
})
export class HllEventModule {}
