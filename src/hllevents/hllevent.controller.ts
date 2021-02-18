import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { HllEventGetAllDto } from './dtos/hllEventGetAll.dto';
import { HLLEventGetByIdDto } from './dtos/hlleventGetById.dto';
import { HllEventService } from './hllevent.service';

@Controller('events')
export class HllEventController {
  constructor(private hllEventService: HllEventService) {}

  @Get()
  async getAll(): Promise<HllEventGetAllDto[]> {
    return this.hllEventService.getAll();
  }

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  getEventById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HLLEventGetByIdDto> {
    return this.hllEventService.getEventById(id);
  }
}
