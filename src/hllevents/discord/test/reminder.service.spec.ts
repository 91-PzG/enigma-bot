import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GuildMember, User } from 'discord.js';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DiscordService } from '../../../discord/discord.service';
import { Enrolment, HllDiscordEvent, HLLEvent, Member } from '../../../typeorm/entities';
import { HLLEventRepository } from '../../hllevent.repository';
import { ReminderService } from '../reminder.service';

describe('ReminderService', () => {
  let service: ReminderService;
  let enrolmentRepository: jest.Mocked<Repository<Enrolment>>;
  let discordService: jest.Mocked<DiscordService>;
  let hllEventRepository: jest.Mocked<HLLEventRepository>;
  let memberRepository: jest.Mocked<Repository<Member>>;
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
    const hllEventRepositoryMock: Partial<HLLEventRepository> = {
      getReminderEventsOne: jest.fn().mockResolvedValue([]),
      getReminderEventsTwo: jest.fn().mockReturnValue([]),
      setReminderOne: jest.fn(),
      setReminderTwo: jest.fn(),
    };
    const memberRepositoryMock: Partial<Repository<Member>> = {
      update: jest.fn(),
    };

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
          provide: HLLEventRepository,
          useValue: hllEventRepositoryMock,
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
    hllEventRepository = module.get(HLLEventRepository);
    memberRepository = module.get(getRepositoryToken(Member));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendReminders', () => {
    const eventOne: Partial<HLLEvent> = {
      name: 'TestEvent',
      discordEvent: { channelId: '23809457397' } as HllDiscordEvent,
    };
    const eventTwo: Partial<HLLEvent> = {
      name: 'TestEvent#2',
      discordEvent: { channelId: '12233435766' } as HllDiscordEvent,
    };
    const members: Partial<Member>[] = [
      { id: '4234234234' },
      { id: '4359830958' },
      { id: 'notfound' },
    ];
    const enrolments: Partial<Enrolment>[] = [{ memberId: '134134' }, { memberId: '7767' }];
    const guildMember: Partial<GuildMember> = {
      send: jest.fn(),
      valueOf: jest.fn(),
      toString: jest.fn(),
    };
    const messageOne = `Vergiss nicht dich für das Event "${eventOne.name}" an- oder abzumelden! <#${eventOne.discordEvent.channelId}>`;
    const messageTwo = `Vergiss nicht, dass das Event "${eventTwo.name}" morgen stattfindet! <#${eventTwo.discordEvent.channelId}>`;

    beforeAll(async () => {
      enrolmentRepository.query.mockResolvedValue(members);
      (queryBuilder.getMany as jest.Mock<any, any>).mockResolvedValue(enrolments);
      discordService.getMember.mockImplementation((user: string | User) => {
        return new Promise((resolve, reject) => {
          if (user == 'notfound') reject();
          resolve(guildMember as GuildMember);
        });
      });
      hllEventRepository.getReminderEventsOne.mockResolvedValue([eventOne as HLLEvent]);
      hllEventRepository.getReminderEventsTwo.mockResolvedValue([eventTwo as HLLEvent]);

      service.checkReminders();
      await new Promise<void>((resolve) =>
        setTimeout(() => {
          resolve();
        }, 2000),
      );
    });

    it('should send message to user', async () => {
      expect(guildMember.send).toHaveBeenCalledWith(messageOne);
      expect(guildMember.send).toHaveBeenCalledWith(messageTwo);
    });
  });
});
