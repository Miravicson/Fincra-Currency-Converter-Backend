import { BaseEntity } from '@common/entities/base.entity';
import { AccountEntity } from '@/accounts/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionEntity } from '@/transactions/entities/transaction.entity';

export class DashboardEntity extends BaseEntity<DashboardEntity> {
  constructor(entity: Partial<DashboardEntity> | null) {
    super(entity, {
      balances: AccountEntity,
      recentTransactions: TransactionEntity,
    });
  }

  @ApiProperty({
    required: true,
    type: AccountEntity,
    nullable: false,
    isArray: true,
  })
  @Type(() => AccountEntity)
  balances: AccountEntity[];

  @ApiProperty({
    required: true,
    type: TransactionEntity,
    nullable: false,
    isArray: true,
  })
  @Type(() => TransactionEntity)
  recentTransactions: TransactionEntity[];
}
