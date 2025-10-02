import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { BullModule } from '@nestjs/bull';
import { AccountsModule } from '@/accounts/accounts.module';
import { TransactionProcessor } from '@/transactions/transaction.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'transactions',
    }),
    AccountsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsService, TransactionProcessor],
  exports: [TransactionsService],
})
export class TransactionsModule {}
