import { Controller, Get } from '@nestjs/common';
import { UserListDto } from './dto/user-list.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/list')
  findAll(): Promise<UserListDto[]> {
    return this.usersService.getUserList();
  }
}
