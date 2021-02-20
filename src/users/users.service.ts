import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities';
import { UserListDto } from './dto/user-list.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  getUserList(): Promise<UserListDto[]> {
    return (this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.contact', 'contact')
      .select('member.id', 'contact.name AS username')
      .where('member.honoraryMember = false')
      .andWhere('member.reserve = false')
      .andWhere('member.memberTill = false')
      .getMany() as unknown) as Promise<UserListDto[]>;
  }

  getMemberById(id: string): Promise<Member | undefined> {
    return this.memberRepository.findOne(id);
  }
}
