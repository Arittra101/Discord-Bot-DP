import {
  IsISO8601,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReminderDto {
  @ApiPropertyOptional({ example: 'Sprint Retrospective', maxLength: 255 })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated agenda for the meeting' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @ApiPropertyOptional({
    example: '2026-06-11T10:00:00Z',
    description: 'ISO 8601 datetime — must be in the future',
  })
  @IsOptional()
  @IsISO8601()
  remindAt?: string;
}
