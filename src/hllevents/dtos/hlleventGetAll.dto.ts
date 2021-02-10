import { IsBoolean, IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class HllEventGetAllDto {
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

  @IsNumber()
  playerCount: number;

  @IsDate()
  registerByDate: Date;
}
