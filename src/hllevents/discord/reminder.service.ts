import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordService } from '../../discord/discord.service';
import { Enrolment, EnrolmentType, HLLEvent, Member } from '../../typeorm/entities';
import { HLLEventRepository } from '../hllevent.repository';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Enrolment) private enrolmentRepository: Repository<Enrolment>,
    private discordService: DiscordService,
    private eventRepository: HLLEventRepository,
  ) {}

  private async sendReminderOne(event: HLLEvent) {
    const enrolments: Member[] = await this.enrolmentRepository.query(
      `SELECT m.id FROM public."member" m WHERE NOT EXISTS (SELECT FROM public."enrolment" e WHERE m.id = e."memberId" AND e."eventId" = ${event.id}) AND m."honoraryMember" = FALSE AND m.reserve = FALSE AND m."memberTill" IS NULL AND NOT (m."memberSince" IS NULL AND m."recruitTill" IS NOT NULL)`,
    );
    const eventChannel = event.discordEvent.channelId;
    const message = `Vergiss nicht dich für das Event "${event.name}" an- oder abzumelden! <#${eventChannel}>`;
    this.sendMessage(
      enrolments.map((e) => e.id),
      message,
    );
  }

  private async sendReminderTwo(event: HLLEvent) {
    const enrolments: Enrolment[] = await this.enrolmentRepository
      .createQueryBuilder('e')
      .select('e.memberId')
      .where('e.eventId = :id and e.enrolmentType = :type', {
        id: event.id,
        type: EnrolmentType.ANMELDUNG,
      })
      .getMany();
    const eventChannel = event.discordEvent.channelId;
    const message = `Vergiss nicht, dass das Event "${event.name}" morgen stattfindet! <#${eventChannel}>`;
    this.sendMessage(
      enrolments.map((e) => e.memberId),
      message,
    );
  }

  private async sendMessage(memberIds: string[], message: string) {
    for (const id in memberIds) {
      const member = await this.discordService.getMember(id);
      member.send(message);
    }
  }

  @Cron('*/5 * * * *')
  async checkReminders() {
    this.eventRepository.getReminderEventsOne().then((events) => {
      events.forEach((event) => {
        this.eventRepository.setReminderOne(event.id);
        this.sendReminderOne(event);
      });
    });
    this.eventRepository.getReminderEventsTwo().then((events) => {
      events.forEach((event) => {
        this.eventRepository.setReminderTwo(event.id);
        this.sendReminderTwo(event);
      });
    });
  }
}
