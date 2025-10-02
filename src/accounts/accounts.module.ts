import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountsQueue } from '@/accounts/accounts.queue';
import { AccountsProcessor } from '@/accounts/accounts.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'accounts',
    }),
  ],
  controllers: [AccountsController],
  providers: [AccountsService, AccountsProcessor, AccountsQueue],
  exports: [AccountsService, AccountsQueue],
})
export class AccountsModule {}
