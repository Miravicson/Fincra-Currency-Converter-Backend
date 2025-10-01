import { IsNotEmpty, IsNumber } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ImpersonateUserDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  impersonateUserId: number;
}
