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

export class HLLEventUpdateControllDto {
  @IsOptional()
  @IsString()
  organisator?: string;

  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}

export class HLLEventUpdateDataDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registerByDate?: Date;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  @Max(100)
  playerCount?: number;

  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;

  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @IsOptional()
  @IsBoolean()
  closed?: boolean;

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
  @IsString()
  channelName?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  autoPublishDate?: Date;
}

export class HLLEventUpdateWrapperDto {
  @ValidateNested()
  @Type(() => HLLEventUpdateControllDto)
  control: HLLEventUpdateControllDto;

  @ValidateNested()
  @Type(() => HLLEventUpdateDataDto)
  data: HLLEventUpdateDataDto;
}
