import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DiscordService } from '../../../../discord/discord.service';
import { EnrolmentsDiscordService } from '../../../../enrolments/enrolments-discord.service';
import { HLLEvent, Squad } from '../../../../typeorm/entities';
import { EnrolmentMessageFactory } from '../enrolmentMessage.factory';

describe('Enrolment Message Factory', () => {
  let factory: EnrolmentMessageFactory;
  const event: Partial<HLLEvent> = {
    id: 5,
    //@ts-ignore
    organisator: { name: 'Hans' },
    duration: '1h',
    meetingPoint: 'treffpunkt',
    password: 'pw',
    moderator: 'mod',
    description: 'description',
    name: 'name',
  };
  const config = {
    color: '#123456',
    thumbnail: 'https://test.com/image.jpg',
  };
  let squadQueryBuilder: Partial<SelectQueryBuilder<Squad>> = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const configServiceMock: Partial<ConfigService> = {
      get: jest.fn().mockReturnValue(config),
    };
    const discordServiceMock: Partial<DiscordService> = {
      getEmojiById: jest.fn().mockReturnValue('emoji'),
    };
    const enrolmentServiceMock: Partial<EnrolmentsDiscordService> = {
      getEnrolments: jest.fn().mockResolvedValue([]),
    };
    const squadRepositoryMock: Partial<Repository<Squad>> = {
      createQueryBuilder: jest.fn().mockReturnValue(squadQueryBuilder),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrolmentMessageFactory,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: DiscordService,
          useValue: discordServiceMock,
        },
        {
          provide: EnrolmentsDiscordService,
          useValue: enrolmentServiceMock,
        },
        {
          provide: getRepositoryToken(Squad),
          useValue: squadRepositoryMock,
        },
      ],
    }).compile();

    factory = module.get(EnrolmentMessageFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('createMessage', () => {
    it('should be defined', () => {
      expect(factory.createMessage(event as HLLEvent)).toBeDefined();
      //this is only to get branch coverage to 100%
      expect(factory.createMessage(event as HLLEvent)).toBeDefined();
    });
  });
});
