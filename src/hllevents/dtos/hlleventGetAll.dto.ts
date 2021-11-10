import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class HLLEventGetAllDto {
  @IsNumber()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsDate()
  date: Date;

  @IsNotEmpty()
  description: string;

  @IsBoolean()
  locked: boolean;

  @IsBoolean()
  closed: boolean;

  @IsOptional()
  @IsNumber()
  maxPlayerCount?: number;

  @IsNumber()
  playerCount: number;

  @IsDate()
  registerByDate: Date;

  @IsBoolean()
  mandatory: boolean;
}
