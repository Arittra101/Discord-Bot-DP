import { IsEmail, IsString, Length, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret1234', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '123456789012345678',
    description: 'Discord snowflake ID (17–19 digits)',
  })
  @IsString()
  @Matches(/^\d{17,19}$/, {
    message: 'discordId must be a valid Discord snowflake',
  })
  discordId: string;

  @ApiProperty({ example: 'Arittra', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  name: string;
}
