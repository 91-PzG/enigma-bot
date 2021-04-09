import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/jwt/get-user.decorator';
import { RoleGuard } from '../auth/jwt/guards/role.guard';
import { Scopes } from '../auth/jwt/guards/scopes.decorator';
import { JwtPayload } from '../auth/jwt/jwt-payload.interface';
import { AccessRoles, Member } from '../postgres/entities';
import { PatchUserDto } from './dto/patch-user.dto';
import { UserListDto } from './dto/user-list.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/list')
  findAll(): Promise<UserListDto[]> {
    return this.usersService.getUserList();
  }

  @Get('/:id')
  findOne(@Param('id') id: string, @GetUser() user: JwtPayload): Promise<Member> {
    return this.usersService.getMemberById(id, user);
  }

  @Scopes(AccessRoles.HUMANRESOURCES)
  @UseGuards(RoleGuard)
  @Patch('/:id')
  patchUser(@Param('id') id: string, @Body() body: PatchUserDto): number {
    return this.usersService.patchUser(id, body);
  }
}
