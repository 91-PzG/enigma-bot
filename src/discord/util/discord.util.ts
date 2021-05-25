import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, GuildMember, Role } from 'discord.js';
import { DiscordConfig } from '../../config/discord.config';
import { AccessRoles, Contact, Division, Member, Rank } from '../../postgres/entities';

@Injectable()
export class DiscordUtil {
  private config: DiscordConfig;

  constructor(config: ConfigService) {
    this.config = config.get('discord');
  }

  public getDivision(roles: Collection<string, Role>): Division {
    if (roles.has(this.config.divisions.armor)) return Division.ARMOR;
    if (roles.has(this.config.divisions.recon)) return Division.RECON;
    if (roles.has(this.config.divisions.artillerie)) return Division.ARTILLERY;
    return Division.INFANTERIE;
  }

  public getRank(roles: Collection<string, Role>): Rank {
    if (roles.has(this.config.ranks.clanrat)) return Rank.CLANRAT;
    if (roles.has(this.config.ranks.officer)) return Rank.OFFICER;
    if (roles.has(this.config.ranks.sergant)) return Rank.SERGANT;
    if (roles.has(this.config.ranks.corporal)) return Rank.CORPORAL;
    if (roles.has(this.config.recruitRole)) return Rank.RECRUIT;
    return Rank.SOLDIER;
  }

  public getRoles(roles: Collection<string, Role>, member: Member): AccessRoles[] {
    const accessRoles = [];

    if (this.isClanMember(roles)) accessRoles.push(AccessRoles.MEMBER);
    if (roles.has(this.config.accessRoles.eventOrga)) accessRoles.push(AccessRoles.EVENTORGA);
    if (roles.has(this.config.accessRoles.humanResources))
      accessRoles.push(AccessRoles.HUMANRESOURCES);
    if (roles.has(this.config.ranks.clanrat)) accessRoles.push(AccessRoles.CLANRAT);
    if (roles.has(this.config.ranks.officer) || roles.has(this.config.ranks.sergant))
      accessRoles.push(AccessRoles.OFFICER);

    if (member.roles?.includes(AccessRoles.SQUADLEAD)) accessRoles.push(AccessRoles.SQUADLEAD);

    if (accessRoles.length == 0) accessRoles.push(AccessRoles.GUEST);

    return accessRoles;
  }

  public isClanMember(roles: Collection<string, Role>): boolean {
    return roles.has(this.config.memberRole);
  }

  public async createMember(user: GuildMember): Promise<Member> {
    const member = new Member();
    member.id = user.id;
    if (user.roles.cache.has(this.config.recruitRole)) {
      member.recruitSince = new Date();
      member.rank = Rank.RECRUIT;
    } else {
      member.memberSince = new Date();
    }

    member.contact = await this.createContact(user);

    return member;
  }

  public async updateMember(user: GuildMember, member: Member) {
    member.reserve = user.roles.cache.has(this.config.reserveRole);
    member.avatar = user.user.avatarURL();
    member.division = this.getDivision(user.roles.cache);
    member.rank = this.getRank(user.roles.cache);
    member.contactId = user.id;

    if (member.rank != 'recruit' && !member.memberSince) {
      member.recruitTill = new Date();
      member.memberSince = new Date();
    }

    member.roles = this.getRoles(user.roles.cache, member);

    member.contact.name = user.displayName;
    member.contact.save();

    member.save();
  }

  private createContact(user: GuildMember): Promise<Contact> {
    const contact = new Contact();
    contact.id = user.id;
    contact.name = user.displayName;
    return contact.save();
  }
}
