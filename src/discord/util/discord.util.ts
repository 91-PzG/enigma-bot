import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Role } from 'discord.js';
import { DiscordConfig } from '../../config/discord.config';
import { Division, Rank } from '../../postgres/entities';

@Injectable()
export class DiscordUtil {
  config: DiscordConfig;

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
}
