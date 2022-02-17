import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/jwt/get-user.decorator';
import { RoleGuard } from '../auth/jwt/guards/role.guard';
import { Scopes } from '../auth/jwt/guards/scopes.decorator';
import { JwtPayload } from '../auth/jwt/jwt-payload.interface';
import { AccessRoles, Member } from '../typeorm/entities';
import { MembersDto } from './dto/members.dto';
import { NameListDto } from './dto/name-list.dto';
import { PatchUserDto } from './dto/patch-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/name-list')
  findNameList(): Promise<NameListDto[]> {
    return this.usersService.getNameList();
  }

  @Get()
  findAll(): Promise<MembersDto[]> {
    return this.usersService.getAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload): Promise<Member> {
    return this.usersService.getMemberById(id, user);
  }

  @Scopes(AccessRoles.HUMANRESOURCES)
  @UseGuards(RoleGuard)
  @Patch('/:id')
  patchUser(@Param('id') id: string, @Body() body: PatchUserDto): Promise<any> {
    return this.usersService.patchUser(id, body);
  }
}
