import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Member } from '../../entities';

export class HLLEventGetByIdDto {
  @IsNumber()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsDate()
  date: Date;

  @IsDate()
  registerByDate: Date;

  @IsNumber()
  playerCount: number;

  @Transform(({ value }: { value: Member }) => value.contact.name)
  organisator: Member;

  @IsBoolean()
  mandatory: boolean;

  @IsBoolean()
  locked: boolean;

  @IsBoolean()
  closed: boolean;

  @IsOptional()
  @IsNumber()
  rounds?: number;

  @IsOptional()
  @IsNotEmpty()
  hllMap?: string;

  @IsOptional()
  @IsNotEmpty()
  commander?: string;

  @IsOptional()
  @IsNotEmpty()
  moderator?: string;
  duration?: number;

  @IsOptional()
  @IsNotEmpty()
  meetingPoint?: string;

  @IsOptional()
  @IsNotEmpty()
  server?: string;

  @IsOptional()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsNumber()
  maxPlayerCount?: number;

  @IsOptional()
  @IsDate()
  briefing?: Date;
}
