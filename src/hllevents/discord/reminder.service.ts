import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordService } from '../../discord/discord.service';
import { Enrolment, EnrolmentType, HLLEvent, Member } from '../../typeorm/entities';
import { HLLEventRepository } from '../hllevent.repository';

@Injectable()
export class ReminderService {
  logger = new Logger('Reminder Service');

  constructor(
    @InjectRepository(Enrolment) private enrolmentRepository: Repository<Enrolment>,
    private discordService: DiscordService,
    private eventRepository: HLLEventRepository,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  private async sendReminderOne(event: HLLEvent) {
    const enrolments: { id: string }[] = await this.enrolmentRepository.query(
      `SELECT m.id FROM public."member" m WHERE NOT EXISTS (SELECT FROM public."enrolment" e WHERE m.id = e."memberId" AND e."eventId" = ${event.id}) AND m."honoraryMember" = FALSE AND m.reserve = FALSE AND m."memberTill" IS NULL AND NOT (m."memberSince" IS NULL AND m."recruitTill" IS NOT NULL)`,
    );
    const eventChannel = event.discordEvent.channelId;
    const message = `Vergiss nicht dich für das Event "${event.name}" an- oder abzumelden! <#${eventChannel}>`;

    this.logger.log(`Sending Reminder One for Event #${event.id} to ${enrolments.length} members`);

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

    this.logger.log(`Sending Reminder Two for Event #${event.id} to ${enrolments.length} members`);

    this.sendMessage(
      enrolments.map((e) => e.memberId),
      message,
    );
  }

  private async sendMessage(memberIds: string[], message: string) {
    for (const id of memberIds) {
      try {
        const member = await this.discordService.getMember(id);
        if (member) member.send(message);
      } catch (error) {
        this.logger.log(`Adding member "${id}" to reserve`);
        this.memberRepository.update(id, { reserve: true });
      }
    }
  }

  @Cron('*/5 * * * *')
  async checkReminders() {
    this.eventRepository.getReminderEventsOne().then((events) => {
      events.forEach((event) => {
        this.sendReminderOne(event);
        this.eventRepository.setReminderOne(event.id);
      });
    });
    this.eventRepository.getReminderEventsTwo().then((events) => {
      events.forEach((event) => {
        this.sendReminderTwo(event);
        this.eventRepository.setReminderTwo(event.id);
      });
    });
  }
}
