import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AccountsService } from './accounts.service';

@Processor('accounts')
export class AccountsProcessor {
  constructor(private readonly accountsService: AccountsService) {}

  @Process('create-accounts')
  async handleCreateAccounts(job: Job<{ userId: number }>) {
    const { userId } = job.data;
    try {
      const accounts = await this.accountsService.createAccountsForUser(userId);
      return accounts;
    } catch (error) {
      console.error(`Failed to create accounts for user ${userId}`, error);
      throw error; // triggers retry
    }
  }
}
