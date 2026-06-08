import {
  IsISO8601,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class UpdateReminderDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @IsOptional()
  @IsISO8601()
  remindAt?: string;
}
