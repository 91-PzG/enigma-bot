import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from '../../../postgres/entities';
import { DiscordService } from '../../discord.service';
import { DiscordUtil } from '../../util/discord.util';
import { UpdateUsersCommand } from '../updateusers.command';

describe('updateUsers command', () => {
  let updateUsers: UpdateUsersCommand;

  beforeEach(async () => {
    const discordServiceMock: Partial<DiscordService> = {};
    const discordUtilMock: Partial<DiscordUtil> = {};
    const configServiceMock: Partial<ConfigService> = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: DiscordService, useValue: discordServiceMock },
        { provide: DiscordUtil, useValue: discordUtilMock },
        {
          provide: getRepositoryToken(Member),
          useValue: {
            findOne: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: configServiceMock },
        UpdateUsersCommand,
      ],
    }).compile();

    updateUsers = module.get<UpdateUsersCommand>(UpdateUsersCommand);
  });

  it('should be defined', () => {
    expect(updateUsers).toBeDefined();
  });
});
