import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AccountsModule } from '@/accounts/accounts.module';
import { TransactionsModule } from '@/transactions/transactions.module';

@Module({
  imports: [TransactionsModule, AccountsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
