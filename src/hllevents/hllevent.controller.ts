import { Controller, Get, NotFoundException } from '@nestjs/common';
import { HllEventService } from './hllevent.service';

@Controller('events')
export class HllEventController {
  constructor(private hllEventService: HllEventService) {}

  @Get()
  async getAll(): Promise<string> {
    throw new NotFoundException();
    //return this.hllEventService.getAll();
  }
}
