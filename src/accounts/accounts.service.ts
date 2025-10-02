import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FundOrWithdrawFromAccountDto } from '@/accounts/dto/fund-or-withdraw-from-account.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaTransactionClient } from '@common/types';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}
  private createAccountData(userId: number) {
    return [
      {
        currencyCode: 'USD',
        currencyName: 'United States Dollar',
        userId,
        currencySymbol: '$',
      },
      {
        currencyCode: 'GBP',
        currencyName: 'British Pound',
        userId,
        currencySymbol: '£',
      },
      {
        currencyCode: 'EUR',
        currencyName: 'Euro',
        userId,
        currencySymbol: '€',
      },
      {
        currencyCode: 'NGN',
        currencyName: 'Nigerian Naira',
        userId,
        currencySymbol: '₦',
      },
    ];
  }

  async fundAccount(
    param: { userId: number; accountId: string },
    dto: FundOrWithdrawFromAccountDto,
  ) {
    const { userId, accountId } = param;
    const amount = new Decimal(dto.amount);

    if (amount.lte(0)) {
      throw new BadRequestException('Funding amount must be greater than 0');
    }

    const account = await this.prisma.account.findUnique({
      where: { id: accountId, userId: userId },
    });

    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }

    const updated = await this.prisma.account.update({
      where: { id: accountId },
      data: {
        availableBalance: { increment: amount },
      },
    });

    return updated;
  }

  async withdrawFromAccount(
    param: { userId: number; accountId: string },
    dto: FundOrWithdrawFromAccountDto,
  ) {
    const { userId, accountId } = param;
    const amount = new Decimal(dto.amount);

    if (amount.lte(0)) {
      throw new BadRequestException('Withdrawal amount must be greater than 0');
    }

    const account = await this.prisma.account.findUnique({
      where: { id: accountId, userId: userId },
    });

    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }

    if (account.availableBalance.lt(amount)) {
      throw new BadRequestException(
        `Insufficient balance: Available ${account.availableBalance}, Requested ${amount}`,
      );
    }

    const updated = await this.prisma.account.update({
      where: { id: accountId },
      data: {
        availableBalance: { decrement: amount },
      },
    });

    return updated;
  }

  async getUserAccounts(userId: number) {
    const userAccounts = await this.prisma.account.findMany({
      where: { userId: userId },
    });

    return userAccounts;
  }

  async getUserAccountById(userId: number, accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId, userId: userId },
      include: {
        info: true,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }

    return account;
  }

  async createAccountsForUser(userId: number) {
    return this.prisma.$transaction(
      async (prismaTx: PrismaTransactionClient) => {
        // Check inside transaction to avoid race conditions
        const alreadyCreatedAccounts = await prismaTx.account.findMany({
          where: { userId },
        });

        if (alreadyCreatedAccounts.length > 0) {
          return alreadyCreatedAccounts;
        }

        const userAccounts = await prismaTx.account.createManyAndReturn({
          data: this.createAccountData(userId),
        });

        return userAccounts;
      },
    );
  }
}
