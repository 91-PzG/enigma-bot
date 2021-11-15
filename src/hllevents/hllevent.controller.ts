import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/jwt/get-user.decorator';
import { RoleGuard } from '../auth/jwt/guards/role.guard';
import { Scopes } from '../auth/jwt/guards/scopes.decorator';
import { JwtPayload } from '../auth/jwt/jwt-payload.interface';
import { AccessRoles } from '../typeorm/entities';
import { HLLEventCreateWrapperDto } from './dtos/hlleventCreate.dto';
import { HLLEventGetAllDto } from './dtos/hlleventGetAll.dto';
import { HLLEventGetByIdDto } from './dtos/hlleventGetById.dto';
import { HLLEventUpdateWrapperDto } from './dtos/hlleventUpdate.dto';
import { HLLEventService } from './hllevent.service';

@Controller('events')
export class HLLEventController {
  constructor(private hllEventService: HLLEventService) {}

  @Get()
  getAll(): Promise<HLLEventGetAllDto[]> {
    return this.hllEventService.getAll();
  }

  @Get('/:id')
  getEventById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtPayload,
  ): Promise<HLLEventGetByIdDto> {
    return this.hllEventService.getEventById(id, user.userId);
  }

  @Scopes(AccessRoles.EVENTORGA)
  @UseGuards(RoleGuard)
  @Patch('/:id')
  patchEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: HLLEventUpdateWrapperDto,
  ): Promise<HLLEventGetByIdDto> {
    return this.hllEventService.patchEvent(id, updateEventDto);
  }

  @Post()
  @UseGuards(RoleGuard)
  @Scopes(AccessRoles.OFFICER, AccessRoles.CLANRAT, AccessRoles.EVENTORGA)
  createEvent(@Body() createEventDto: HLLEventCreateWrapperDto): Promise<HLLEventGetByIdDto> {
    return this.hllEventService.createEvent(createEventDto);
  }

  @Patch('/:id')
  @UseGuards(RoleGuard)
  @Scopes(AccessRoles.OFFICER, AccessRoles.CLANRAT, AccessRoles.EVENTORGA)
  switchSquadVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Query('showSquads', ParseBoolPipe) showSquads: boolean,
  ) {
    return this.hllEventService.switchSquadVisibility(id, showSquads);
  }
}
