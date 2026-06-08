import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldSecret123' })
  @IsString()
  @MinLength(1)
  oldPassword: string;

  @ApiProperty({ example: 'newSecret456', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
