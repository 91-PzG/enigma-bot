import { Controller, Get, Param } from '@nestjs/common';
import { Member } from '../entities';
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
  findOne(@Param('id') id: string): Promise<Member> {
    return this.usersService.getMemberById(id);
  }
}
