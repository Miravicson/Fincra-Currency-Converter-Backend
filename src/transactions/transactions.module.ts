import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { BullModule } from '@nestjs/bull';
import { AccountsModule } from '@/accounts/accounts.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'transactions',
    }),
    AccountsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsService],
})
export class TransactionsModule {}
