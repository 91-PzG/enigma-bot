import {
  ConflictException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { EntityRepository, Repository } from 'typeorm';
import { Member } from '../postgres/entities';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { JwtPayload, JwtWrapper } from './jwt/jwt-payload.interface';

@EntityRepository(Member)
export class AuthRepository extends Repository<Member> {
  private logger = new Logger('AuthRepository');

  async setPassword(clearPassword: string, id: string): Promise<void> {
    const { salt, password } = this.hashPassword(clearPassword);

    const affected = (
      await this.createQueryBuilder()
        .update(Member)
        .set({ salt, password, mustChangePassword: true })
        .where('id = :id', { id })
        .execute()
    ).affected;
    if (!affected) throw new Error(`No user with id '${id}' found.`);
  }

  private hashPassword(clearPassword: string): { password: string; salt: string } {
    const salt = bcrypt.genSaltSync();
    const password = bcrypt.hashSync(clearPassword, salt);
    return { password, salt };
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<JwtWrapper> {
    const member = await this.getMemberByName(changePasswordDto.username);

    if (!member) throw new NotFoundException('Username not found');
    if (!(await member.validatePassword(changePasswordDto.oldPassword)))
      throw new UnauthorizedException('Passwort ungültig');

    const { salt, password } = this.hashPassword(changePasswordDto.newPassword);
    member.mustChangePassword = false;
    member.salt = salt;
    member.password = password;
    await member.save();
    return this.generateJwtWrapper(member);
  }

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<JwtWrapper> {
    const { username, password } = authCredentialsDto;
    const member = await this.getMemberByName(username);

    if (!member) throw new UnauthorizedException('Invalid credentials');
    //if (member.mustChangePassword) throw new ForbiddenException('Must change password');
    if (!member.password) throw new ConflictException('User not registered yet');
    if (!(await member.validatePassword(password)))
      throw new UnauthorizedException('Invalid credentials');

    return this.generateJwtWrapper(member);
  }

  async discordSignIn(id: string): Promise<JwtWrapper> {
    const member = await this.findOne(id);

    if (!member) throw new NotFoundException('User not found');
    return this.generateJwtWrapper(member);
  }

  private async getMemberByName(username: string): Promise<Member | undefined> {
    return this.createQueryBuilder('member')
      .select('member')
      .leftJoinAndSelect('member.contact', 'contact')
      .addSelect('member.password')
      .addSelect('member.salt')
      .where(
        'contact.name = :username AND member.memberTill is NULL AND member.honoraryMember = false',
        { username },
      )
      .getOne();
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
