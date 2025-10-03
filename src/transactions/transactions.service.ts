import { BadRequestException, Injectable } from '@nestjs/common';
import { ConvertFundsDto } from '@/transactions/dto/convert-funds.dto';
import { GetManyTransactionsDto } from '@/transactions/dto/get-many-transactions.dto';
import { createPaginator } from 'prisma-pagination';
import { Prisma, Transaction, TransactionStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BasicQueryFilterWithFilter,
  PrismaTransactionClient,
} from '@common/types';
import { Decimal, DefaultArgs } from '@prisma/client/runtime/client';
import { randomUUID } from 'crypto';
// import { ExchangeRateHostService } from '@common/integrations/exchange-rate-host.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CreateTransaction } from '@/transactions/create-transaction.interface';
import { AccountsService } from '@/accounts/accounts.service';
import { ExchangeRateService } from '@common/integrations/exchange-rate/exchange-rate.service';
import { SortOrderEnum } from '@common/constant';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exchangerService: ExchangeRateService,
    private readonly accountsService: AccountsService,
    @InjectQueue('transactions') private readonly transactionQueue: Queue,
  ) {}

  async convertFunds(userId: number, dto: ConvertFundsDto) {
    const [fromAccount, toAccount] = await Promise.all([
      this.accountsService.getUserAccountById(userId, dto.fromAccountId),
      this.accountsService.getUserAccountById(userId, dto.toAccountId),
    ]);

    return this.createForexTransaction({
      amount: new Decimal(dto.amount),
      fromAccount: fromAccount,
      toAccount: toAccount,
      userId: userId,
    });
  }

  generateTransactionReference(prefix = 'txn'): string {
    return `${prefix}_${Date.now()}_${randomUUID().slice(0, 8)}`.toUpperCase();
  }

  async getManyTransactions(userId: number, dto: GetManyTransactionsDto) {
    const {
      perPage,
      page,
      fields,
      sortBy = 'createdAt',
      startDate,
      endDate,
      sortDirection = SortOrderEnum.DESC,
      ...restDto
    } = dto;

    const filter: Partial<
      BasicQueryFilterWithFilter<Prisma.TransactionFindManyArgs<DefaultArgs>>
    > = {
      where: { userId: userId, ...restDto },
      orderBy: { [sortBy]: sortDirection },
    };

    const paginate = createPaginator({ perPage, page });
    const paginated = await paginate<
      Transaction,
      Prisma.TransactionFindManyArgs
    >(this.prisma.transaction, filter, { page });
    return paginated;
  }

  async createForexTransaction(options: CreateTransaction) {
    const reference = this.generateTransactionReference();

    const { currencyCode: fromCurrency, id: fromAccountId } =
      options.fromAccount;
    const { currencyCode: toCurrency, id: toAccountId } = options.toAccount;
    const amount = options.amount;

    const conversionResult = await this.exchangerService.convert({
      amount: options.amount,
      fromCurrency,
      toCurrency,
    });

    // Step 1: Create transaction in PENDING
    const transaction = await this.prisma.transaction.create({
      data: {
        reference,
        userId: options.userId,
        fromAccountId,
        toAccountId,
        fromCurrency,
        toCurrency,
        conversionRate: conversionResult.exchangeRate,
        originalAmount: amount,
        convertedAmount: conversionResult.convertedAmount,
        status: TransactionStatus.Pending,
      },
    });

    await this.transactionQueue.add(
      'process-transaction',
      { transactionId: transaction.id },
      {
        attempts: 5, // retry up to 5 times
        backoff: { type: 'exponential', delay: 3000 }, // wait before retry
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return transaction;
  }

  /**
   * Processor calls this method inside a queue worker
   */
  async processTransaction(transactionId: number) {
    // Step 1: Mark as PROCESSING
    const transaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.Processing },
    });

    try {
      await this.prisma.$transaction(
        async (prismaTx: PrismaTransactionClient) => {
          const fromAccount = await prismaTx.account.update({
            where: { id: transaction.fromAccountId },
            data: {
              availableBalance: { decrement: transaction.originalAmount },
            },
          });

          if (fromAccount.availableBalance.lt(0)) {
            throw new BadRequestException('Insufficient funds');
          }

          await prismaTx.account.update({
            where: { id: transaction.toAccountId },
            data: {
              availableBalance: { increment: transaction.convertedAmount },
            },
          });
        },
      );

      // Step 2: Mark as SUCCESS
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.Completed },
      });
    } catch (err) {
      // Step 3: Mark as FAILED
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.Failed },
      });

      throw err; // triggers retry if queue config allows
    }
  }

  async getTransactionByReference(userId: number, reference: string) {
    return this.prisma.transaction.findUnique({
      where: { reference, userId: userId },
    });
  }

  async requery(userId: number, reference: string) {
    return this.getTransactionByReference(userId, reference);
  }
}
