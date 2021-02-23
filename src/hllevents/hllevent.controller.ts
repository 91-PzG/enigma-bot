import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventGuard } from '../auth/jwt/guards/event.guard';
import { Member } from '../entities';
import { HLLEventCreateWrapperDto } from './dtos/hlleventCreate.dto';
import { HLLEventGetAllDto } from './dtos/hlleventGetAll.dto';
import { HLLEventGetByIdDto } from './dtos/hlleventGetById.dto';
import { HLLEventUpdateWrapperDto } from './dtos/hlleventUpdate.dto';
import { HLLEventService } from './hllevent.service';

@Controller('events')
export class HLLEventController {
  constructor(private hllEventService: HLLEventService) {}

  @Get()
  async getAll(): Promise<HLLEventGetAllDto[]> {
    return this.hllEventService.getAll();
  }

  @Get('/:id')
  async getEventById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HLLEventGetByIdDto> {
    const event = (await this.hllEventService.getEventById(
      id,
    )) as HLLEventGetByIdDto;
    event.organisator = (event.organisator as Member).contact.name;
    return event;
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
