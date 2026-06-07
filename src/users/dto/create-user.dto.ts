import { IsEmail, IsString, Length, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Matches(/^\d{17,19}$/, {
    message: 'discordId must be a valid Discord snowflake',
  })
  discordId: string;

  @IsString()
  @Length(1, 100)
  name: string;
}
