import { ApiProperty } from '@nestjs/swagger';
import { getPasswordRegex } from '@utils/index';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(getPasswordRegex(), { message: 'password is too weak' })
  readonly password: string;
}
