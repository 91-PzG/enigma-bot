import { Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { JwtPayload } from '../auth/jwt/jwt-payload.interface';
import { AccessRoles, Division, Member } from '../typeorm/entities';
import { PatchUserDto } from './dto/patch-user.dto';
import { UserListDto } from './dto/user-list.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async getUserList(): Promise<UserListDto[]> {
    return (await this.memberRepository
      .createQueryBuilder('member')
      .leftJoin('member.contact', 'contact')
      .select(['member.id AS id', 'contact.name AS username'])
      .where('member.honoraryMember = false')
      .andWhere('member.reserve = false')
      .andWhere('member.memberTill IS NULL')
      .getRawMany()) as unknown as Promise<UserListDto[]>;
  }

  async getMemberById(id: string, user?: JwtPayload): Promise<Member> {
    const accessRoles: AccessRoles[] = [AccessRoles.CLANRAT, AccessRoles.HUMANRESOURCES];
    const eventorga = id == user?.userId || user?.roles.includes(AccessRoles.EVENTORGA);
    const hr = user?.roles.some((role) => accessRoles.includes(role as AccessRoles));
    const query = this.defaultMemberSelectQuery(id);
    if (eventorga || hr) query.addSelect(['member.missedEvents', 'member.missedConsecutiveEvents']);
    if (hr) query.addSelect('contact.comment');
    const member = await query.getOne();

    if (!member) throw new NotFoundException(`User with id ${id} not found`);
    return member;
  }

  private defaultMemberSelectQuery(id: string): SelectQueryBuilder<Member> {
    return this.memberRepository
      .createQueryBuilder('member')
      .leftJoin('member.contact', 'contact')
      .select([
        'member.id',
        'member.recruitSince',
        'member.recruitTill',
        'member.memberSince',
        'member.memberTill',
        'member.reserve',
        'member.avatar',
        'member.honoraryMember',
        'member.division',
        'member.rank',
        'member.roles',
        'contact.name',
        'contact.id',
        'member.contactId',
      ])
      .where('member.id = :id', { id });
  }

  getActiveMember(id: string) {
    return this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.contact', 'contact')
      .where('member.memberTill IS NULL')
      .andWhere('member.reserve = false')
      .andWhere('member.honoraryMember=false')
      .andWhere('member.id = :id', { id })
      .getOne();
  }

  async getDivisionForMember(id: string): Promise<Division | undefined> {
    return (
      await this.memberRepository
        .createQueryBuilder()
        .select('division')
        .where('id = :id', { id })
        .getOne()
    )?.division;
  }

  patchUser(id: string, body: PatchUserDto): number {
    throw new NotImplementedException();
  }
}
