import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { $Enums, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionFilterDto {
  @IsEnum($Enums.TransactionStatus)
  @IsOptional()
  @ApiProperty({
    enum: $Enums.TransactionStatus,
    enumName: 'TransactionStatus',
    required: false,
  })
  readonly status?: $Enums.TransactionStatus;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reference?: string;

  @IsOptional()
  @IsEnum(Prisma.TransactionScalarFieldEnum)
  @ApiProperty({
    enum: Prisma.TransactionScalarFieldEnum,
    enumName: 'TransactionSortBy',
    required: false,
  })
  readonly sortBy?: Prisma.TransactionScalarFieldEnum;
}
