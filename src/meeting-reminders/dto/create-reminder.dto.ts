import { IsISO8601, IsString, Length, MinLength } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsISO8601()
  remindAt: string;
}
