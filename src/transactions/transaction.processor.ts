import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TransactionsService } from '@/transactions/transactions.service';

@Processor('transactions')
export class TransactionProcessor {
  constructor(private readonly transactionService: TransactionsService) {}

  @Process('process-transaction')
  async handleTransaction(job: Job<{ transactionId: number }>) {
    const { transactionId } = job.data;

    await this.transactionService.processTransaction(transactionId);
  }
}
