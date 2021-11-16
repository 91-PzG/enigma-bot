import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HLLEvent } from '../../../../typeorm/entities';
import { InformationMessageFactory } from '../informationMessage.factory';

describe('Information Message Factory', () => {
  let factory: InformationMessageFactory;
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

  beforeEach(async () => {
    const configServiceMock: Partial<ConfigService> = {
      get: jest.fn().mockReturnValue(config),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InformationMessageFactory,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    factory = module.get(InformationMessageFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('createMessage', () => {
    it('should be defined', () => {
      expect(factory.createMessage(event as HLLEvent)).toBeDefined();
    });
  });
});
