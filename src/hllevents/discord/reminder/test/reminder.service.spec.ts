import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GuildMember } from 'discord.js';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DiscordService } from '../../../../discord/discord.service';
import { Enrolment, HllDiscordEvent, HLLEvent, Member } from '../../../../typeorm/entities';
import { ReminderService } from '../reminder.service';

describe('ReminderService', () => {
  let service: ReminderService;
  let enrolmentRepository: jest.Mocked<Repository<Enrolment>>;
  let discordService: jest.Mocked<DiscordService>;
  let queryBuilder: Partial<SelectQueryBuilder<Enrolment>> = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const discordServiceMock: Partial<DiscordService> = {
      getMember: jest.fn(),
    };

    const enrolmentRepositoryMock: Partial<Repository<Enrolment>> = {
      query: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const memberRepositoryMock: Partial<Repository<Member>> = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReminderService,
        {
          provide: DiscordService,
          useValue: discordServiceMock,
        },
        {
          provide: getRepositoryToken(Enrolment),
          useValue: enrolmentRepositoryMock,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: memberRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<ReminderService>(ReminderService);
    enrolmentRepository = module.get(getRepositoryToken(Enrolment));
    discordService = module.get(DiscordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMissingEnrolmentOne', () => {
    const event: Partial<HLLEvent> = {
      name: 'TestEvent',
      discordEvent: { channelId: '23809457397' } as HllDiscordEvent,
    };
    const members: Partial<Member>[] = [{ id: '4234234234' }, { id: '4359830958' }];
    const guildMember: Partial<GuildMember> = {
      send: jest.fn(),
      valueOf: jest.fn(),
      toString: jest.fn(),
    };
    const message = `Vergiss nicht dich für das Event "${event.name}" an- oder abzumelden! <#${event.discordEvent.channelId}>`;

    beforeEach(() => {
      enrolmentRepository.query.mockResolvedValue(members);
      discordService.getMember.mockResolvedValue(guildMember as GuildMember);
    });

    it('should call getMember or all members', async () => {
      await service.getMissingEnrolmentOne(event as HLLEvent);
      members.forEach((member) => {
        expect(discordService.getMember).toHaveBeenCalledWith(member.id);
      });
    });

    it('should send message to user', async () => {
      await service.getMissingEnrolmentOne(event as HLLEvent);
      expect(guildMember.send).toHaveBeenCalledWith(message);
    });
  });

  describe('getMissingEnrolmentTwo', () => {
    const event: Partial<HLLEvent> = {
      name: 'TestEvent',
      discordEvent: { channelId: '23809457397' } as HllDiscordEvent,
      id: 1,
    };
    const missingMembers: Partial<Enrolment>[] = [
      { memberId: '4234234234' },
      { memberId: '4359830958' },
    ];
    const guildMember: Partial<GuildMember> = {
      send: jest.fn(),
      valueOf: jest.fn(),
      toString: jest.fn(),
    };
    const message = `Vergiss nicht, dass das Event "${event.name}" morgen stattfindet! <#${event.discordEvent.channelId}>`;

    beforeEach(() => {
      queryBuilder.getMany = jest.fn().mockResolvedValue(missingMembers);
      discordService.getMember.mockResolvedValue(guildMember as GuildMember);
    });

    it('should call getMember or all members', async () => {
      await service.getMissingEnrolmentTwo(event as HLLEvent);
      missingMembers.forEach((member) => {
        expect(discordService.getMember).toHaveBeenCalledWith(member.memberId);
      });
    });

    it('should send message to user', async () => {
      await service.getMissingEnrolmentTwo(event as HLLEvent);
      expect(guildMember.send).toHaveBeenCalledWith(message);
    });
  });
});
