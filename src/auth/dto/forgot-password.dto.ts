import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ForgotPasswordDto {
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;
}
