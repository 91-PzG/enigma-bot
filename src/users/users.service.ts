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

  async getUserList(): Promise<UserListDto[]> {
    return ((await this.memberRepository
      .createQueryBuilder('member')
      .leftJoin('member.contact', 'contact')
      .select(['member.id AS id', 'contact.name AS username'])
      .where('member.honoraryMember = false')
      .andWhere('member.reserve = false')
      .andWhere('member.memberTill IS NULL')
      .getRawMany()) as unknown) as Promise<UserListDto[]>;
  }

  getMemberById(id: string): Promise<Member | undefined> {
    return this.memberRepository.findOne(id);
  }
}
