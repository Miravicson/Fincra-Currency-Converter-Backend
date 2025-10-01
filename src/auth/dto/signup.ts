import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  Validate,
} from 'class-validator';
import { UserEmailNotExists } from '@common/user-email-not-exists.validation';

export class SignupDto {
  @IsEmail()
  @ApiProperty({ example: 'victor@company.com' })
  @MaxLength(255)
  @Validate(UserEmailNotExists)
  email: string;

  @IsString()
  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  firstName?: string;

  @IsString()
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  lastName?: string;
}
