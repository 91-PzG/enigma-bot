import { IsOptional, IsString } from 'class-validator';

export class PatchUserDto {
  @IsString()
  @IsOptional()
  comment: string;
  @IsString()
  @IsOptional()
  memberSince: string;
  @IsString()
  @IsOptional()
  recruitSince: string;
  @IsString()
  @IsOptional()
  memberTill: string;
  @IsString()
  @IsOptional()
  recruitTill: string;
}
