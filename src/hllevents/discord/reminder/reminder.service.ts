import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordService } from '../../../discord/discord.service';
import { Enrolment, EnrolmentType, HLLEvent, Member } from '../../../postgres/entities';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Enrolment) private enrolmentRepository: Repository<Enrolment>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    private discordService: DiscordService,
  ) {}

  async getMissingEnrolmentOne(event: HLLEvent) {
    const missingMember: Member[] = await this.enrolmentRepository.query(
      `SELECT m.id FROM public."member" m WHERE NOT EXISTS (SELECT FROM public."enrolment" e WHERE m.id = e."memberId" AND e."eventId" = ${event.id}) AND m."honoraryMember" = FALSE AND m.reserve = FALSE AND m."memberTill" IS NULL AND NOT (m."memberSince" IS NULL AND m."recruitTill" IS NOT NULL)`,
    );
    const eventChannel = event.discordEvent.channelId;
    missingMember.forEach(async (element) => {
      const member = await this.discordService.getMember(element.id);
      member.send(
        `Vergiss nicht dich für das Event "${event.name}" an- oder abzumelden! <#${eventChannel}>`,
      );
    });
  }

  async getMissingEnrolmentTwo(event: HLLEvent) {
    const missingMembers: Enrolment[] = await this.enrolmentRepository
      .createQueryBuilder('e')
      .select('e.memberId')
      .where('e.eventId = :id and e.enrolmentType = :type', {
        id: event.id,
        type: EnrolmentType.ANMELDUNG,
      })
      .getMany();
    const eventChannel = event.discordEvent.channelId;
    missingMembers.forEach(async (element) => {
      const member = await this.discordService.getMember(element.memberId);
      member.send(
        `Vergiss nicht, dass das Event "${event.name}" morgen stattfindet! <#${eventChannel}>`,
      );
    });
  }
}
