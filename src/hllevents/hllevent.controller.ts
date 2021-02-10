import { Controller, Get } from '@nestjs/common';
import { HllEventGetAllDto } from './dtos/hlleventGetAll.dto';
import { HllEventService } from './hllevent.service';

@Controller('events')
export class HllEventController {
  constructor(private hllEventService: HllEventService) {}

  @Get()
  async getAll(): Promise<HllEventGetAllDto[]> {
    return this.hllEventService.getAll();
  }
}
