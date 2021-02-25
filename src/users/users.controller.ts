import { Controller, Get, Param } from '@nestjs/common';
import { GetUser } from '../auth/jwt/get-user.decorator';
import { JwtPayload } from '../auth/jwt/jwt-payload.interface';
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
  findOne(
    @Param('id') id: string,
    @GetUser() user: JwtPayload,
  ): Promise<Member> {
    return this.usersService.getMemberById(id, user);
  }
}
