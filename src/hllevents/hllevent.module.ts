import { Module } from '@nestjs/common';
import { HllEventController } from './hllevent.controller';
import { HllEventService } from './hllevent.service';

@Module({
  controllers: [HllEventController],
  providers: [HllEventService],
})
export class HllEventModule {}
