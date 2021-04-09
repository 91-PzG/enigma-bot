import { IsString } from 'class-validator';

export class PatchUserDto {
  @IsString()
  comment: string;
}
