import { Inject, Injectable } from '@nestjs/common';
import { TransactionsService } from '@/transactions/transactions.service';
import { AccountsService } from '@/accounts/accounts.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheManagerEnumCacheKey, SortOrderEnum } from '@common/constant';
import { Account, Transaction } from '@prisma/client';

@Injectable()
export class DashboardService {
  private transactionsTTLMs = 60_000; // 1 minute
  private accountsTTLMs = 30_000; // 30 seconds

  constructor(
    private readonly transactionService: TransactionsService,
    private readonly accountService: AccountsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getDashboardData(userId: number) {
    const [balances, recentTransactions] = await Promise.all([
      this.getUserAccountsBalances(userId),
      this.getRecentTransactions(userId),
    ]);

    return { balances, recentTransactions };
  }

  private async getUserAccountsBalances(userId: number): Promise<Account[]> {
    const cacheKey = `${CacheManagerEnumCacheKey.DashboardAccounts}:${userId}`;
    const savedUserAccounts = await this.cacheManager.get<Account[]>(cacheKey);

    if (savedUserAccounts) {
      return savedUserAccounts;
    }

    const userAccounts = await this.accountService.getUserAccounts(userId);

    await this.cacheManager.set<Account[]>(
      cacheKey,
      userAccounts,
      this.accountsTTLMs,
    );

    return userAccounts;
  }

  private async getRecentTransactions(userId: number): Promise<Transaction[]> {
    const cacheKey = `${CacheManagerEnumCacheKey.DashboardRecentTransaction}:${userId}`;
    const savedRecentTransactions =
      await this.cacheManager.get<Transaction[]>(cacheKey);

    if (savedRecentTransactions) {
      return savedRecentTransactions;
    }

    const recentTransactions =
      await this.transactionService.getManyTransactions(userId, {
        sortBy: 'createdAt',
        sortDirection: SortOrderEnum.DESC,
        page: 1,
        perPage: 10,
      });

    await this.cacheManager.set<Transaction[]>(
      cacheKey,
      recentTransactions.data,
      this.transactionsTTLMs,
    );

    return recentTransactions.data;
  }
}
