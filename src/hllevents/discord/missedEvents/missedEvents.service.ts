import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEmbed, WebhookClient } from 'discord.js';
import { Repository } from 'typeorm';
import { DiscordConfig } from '../../../config/discord.config';
import { Contact, Enrolment, HLLEvent, Member } from '../../../postgres/entities';

@Injectable()
export class MissedEventsService {
  persoWebhook: WebhookClient;

  constructor(
    @InjectRepository(Enrolment) private enrolmentRepository: Repository<Enrolment>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    configService: ConfigService,
  ) {
    const discordConfig: DiscordConfig = configService.get('discord');
    this.persoWebhook = new WebhookClient(
      discordConfig.persoWebhook.id,
      discordConfig.persoWebhook.token,
    );
    console.log(discordConfig.persoWebhook);
  }

  async getMissedEvents(event: HLLEvent) {
    await this.memberRepository
      .createQueryBuilder()
      .update(Member)
      .set({
        missedConsecutiveEvents: () => '"missedConsecutiveEvents" + 1',
        missedEvents: () => '"missedEvents" + 1',
      })
      .where(
        `member."honoraryMember" = FALSE AND member.reserve = FALSE AND member."memberTill" IS NULL AND NOT (member."memberSince" IS NULL AND member."recruitTill" IS NOT NULL) AND NOT EXISTS (SELECT FROM public."enrolment" e WHERE member.id = e."memberId" AND e."eventId" = :id)`,
        { id: event.id },
      )
      .execute();

    const reportableUsers: any[] = await this.memberRepository
      .createQueryBuilder('m')
      .leftJoin(Contact, 'c', 'm.id=c.id')
      .select(['c."name"', 'm."missedConsecutiveEvents"'])
      .where('"missedConsecutiveEvents" >= 3')
      .getRawMany();

    reportableUsers.forEach((member) => {
      this.reportUser(member.name, member.missedConsecutiveEvents);
    });
  }

  reportUser(name: string, missedConsecutiveEvents: number) {
    const embed = new MessageEmbed()
      .setTitle(`${name} hat ${missedConsecutiveEvents} Events in Folge verpasst`)
      .setColor('#0099ff');

    this.persoWebhook.send('', {
      username: 'Enigma-Bot',
      embeds: [embed],
    });
  }
}
