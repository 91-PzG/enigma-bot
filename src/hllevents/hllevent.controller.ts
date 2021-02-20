import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventGuard } from '../auth/jwt/guards/event.guard';
import { HLLEventCreateWrapperDto } from './dtos/hllEventCreate.dto';
import { HLLEventGetAllDto } from './dtos/hllEventGetAll.dto';
import { HLLEventGetByIdDto } from './dtos/hlleventGetById.dto';
import { HLLEventUpdateWrapperDto } from './dtos/hllEventUpdate.dto';
import { HLLEventService } from './hllevent.service';

@Controller('events')
export class HLLEventController {
  constructor(private hllEventService: HLLEventService) {}

  @Get()
  async getAll(): Promise<HLLEventGetAllDto[]> {
    return this.hllEventService.getAll();
  }

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  getEventById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HLLEventGetByIdDto> {
    return this.hllEventService.getEventById(id);
  }

  @UseGuards(EventGuard)
  @Patch('/:id')
  patchEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: HLLEventUpdateWrapperDto,
  ): Promise<void> {
    return this.hllEventService.patchEvent(id, updateEventDto);
  }

  @UseGuards(EventGuard)
  @Post()
  createEvent(
    @Body() createEventDto: HLLEventCreateWrapperDto,
  ): Promise<number> {
    return this.hllEventService.createEvent(createEventDto);
  }
}
