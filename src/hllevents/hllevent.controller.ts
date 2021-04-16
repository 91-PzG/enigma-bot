import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/jwt/get-user.decorator';
import { RoleGuard } from '../auth/jwt/guards/role.guard';
import { Scopes } from '../auth/jwt/guards/scopes.decorator';
import { JwtPayload } from '../auth/jwt/jwt-payload.interface';
import { AccessRoles, HLLEvent } from '../postgres/entities';
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
    @GetUser() user: JwtPayload,
  ): Promise<HLLEventGetByIdDto> {
    return this.setOrganisator(await this.hllEventService.getEventById(id, user.userId));
  }

  @Scopes(AccessRoles.EVENTORGA)
  @UseGuards(RoleGuard)
  @Patch('/:id')
  async patchEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: HLLEventUpdateWrapperDto,
  ): Promise<HLLEventGetByIdDto> {
    return this.setOrganisator(await this.hllEventService.patchEvent(id, updateEventDto));
  }

  @Post()
  @UseGuards(RoleGuard)
  @Scopes(AccessRoles.OFFICER, AccessRoles.CLANRAT, AccessRoles.EVENTORGA)
  async createEvent(@Body() createEventDto: HLLEventCreateWrapperDto): Promise<HLLEventGetByIdDto> {
    return this.setOrganisator(await this.hllEventService.createEvent(createEventDto));
  }

  private setOrganisator(event: HLLEvent): HLLEventGetByIdDto {
    const e = event as HLLEventGetByIdDto;
    e.organisator = event.organisator?.name;
    return e;
  }
}
