import { IsString } from 'class-validator';

export class ChangePasswordDto {
	@IsString()
	newPassword: string;

	@IsString()
	oldPassword: string;

	@IsString()
	username: string;
}
