import { IsISO8601, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReminderDto {
  @ApiProperty({ example: 'Sprint Planning', maxLength: 255 })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiProperty({ example: 'Review Q3 goals and assign tasks' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({
    example: '2026-06-10T10:00:00Z',
    description: 'ISO 8601 datetime — must be in the future',
  })
  @IsISO8601()
  remindAt: string;
}
