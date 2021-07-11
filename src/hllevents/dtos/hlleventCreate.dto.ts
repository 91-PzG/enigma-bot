import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  ValidateNested,
} from 'class-validator';

export class HLLEventCreateControlDto {
  @IsString()
  organisator: string;

  @IsBoolean()
  publish: boolean;
}

export class HLLEventCreateDataDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @Type(() => Date)
  @IsDate()
  registerByDate: Date;

  @IsBoolean()
  mandatory: boolean;

  @IsString()
  channelName: string;

  @IsBoolean()
  singlePool: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsInt()
  rounds?: number;

  @IsOptional()
  @IsString()
  hllMap?: string;

  @IsOptional()
  @IsString()
  faction?: string;

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
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  @Max(100)
  maxPlayerCount?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  briefing?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  autoPublishDate?: Date;
}

export class HLLEventCreateWrapperDto {
  @ValidateNested()
  @Type(() => HLLEventCreateDataDto)
  data: HLLEventCreateDataDto;

  @ValidateNested()
  @Type(() => HLLEventCreateControlDto)
  control: HLLEventCreateControlDto;
}
