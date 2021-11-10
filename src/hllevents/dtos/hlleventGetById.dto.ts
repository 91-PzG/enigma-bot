import { Transform } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Contact, Member } from '../../typeorm/entities';

export class HLLEventGetByIdDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDate()
  date: Date;

  @IsDate()
  registerByDate: Date;

  @IsNumber()
  playerCount: number;

  @Transform(({ value }: { value: Member }) => 'avcs')
  organisator: Contact | string;

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
  @IsString()
  hllMap?: string;

  @IsOptional()
  @IsString()
  commander?: string;

  @IsOptional()
  @IsString()
  moderator?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @IsOptional()
  @IsString()
  server?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  maxPlayerCount?: number;

  @IsOptional()
  @IsDate()
  briefing?: Date;
}
