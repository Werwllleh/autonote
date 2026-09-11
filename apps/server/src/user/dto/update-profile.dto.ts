import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  currentPassword: string;
}

export class UpdatePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class UpdateNotificationSettingsDto {
  @IsBoolean()
  expenseRemindersEnabled: boolean;
}
