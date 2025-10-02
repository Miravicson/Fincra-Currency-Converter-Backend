import { BaseEntity } from '@common/entities/base.entity';
import { $Enums, Transaction } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger/index';
import { Exclude } from 'class-transformer';

export class TransactionEntity
  extends BaseEntity<TransactionEntity>
  implements Transaction
{
  id: number;
  userId: number;

  reference: string;
  fromCurrency: string;
  toCurrency: string;
  conversionRate: number;

  @ApiProperty({
    enum: $Enums.TransactionStatus,
    enumName: 'TransactionStatus',
    required: false,
  })
  status: $Enums.TransactionStatus;

  @Exclude()
  @ApiHideProperty()
  createdAt: Transaction['createdAt'];

  @Exclude()
  @ApiHideProperty()
  updatedAt: Transaction['updatedAt'];

  constructor(entity: Partial<TransactionEntity> | null) {
    super(entity);
  }
}
