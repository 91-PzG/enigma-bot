import { NotFoundException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Member } from '../postgres/entities';
import { JwtPayload, JwtWrapper } from './jwt/jwt-payload.interface';

@EntityRepository(Member)
export class AuthRepository extends Repository<Member> {
  async signIn(id: string): Promise<JwtWrapper> {
    const member = await this.findOne(id);

    if (!member) throw new NotFoundException('User not found');
    return this.generateJwtWrapper(member);
  }

  private async generateJwtWrapper(member: Member): Promise<JwtWrapper> {
    return {
      accessToken: this.generateAccessToken(member),
    };
  }

  private generateAccessToken(member: Member): JwtPayload {
    return {
      userId: member.id,
      username: member.contact.name,
      avatar: member.avatar || undefined,
      roles: member.roles,
    };
  }
}
