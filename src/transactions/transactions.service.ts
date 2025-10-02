import { Injectable } from '@nestjs/common';
import { ConvertFundsDto } from '@/transactions/dto/convert-funds.dto';
import { TransactionEntity } from '@/transactions/entities/transaction.entity';
import { GetManyTransactionsDto } from '@/transactions/dto/get-many-transactions.dto';
import { createPaginator } from 'prisma-pagination';
import { Prisma, Transaction } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { BasicQueryFilterWithFilter } from '@common/types';
import { DefaultArgs } from '@prisma/client/runtime/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}
  async convertFunds(id: number, dto: ConvertFundsDto) {
    return { id, dto } as unknown as TransactionEntity;
  }

  async getManyTransactions(userId: number, dto: GetManyTransactionsDto) {
    const {
      perPage,
      page,
      fields,
      sortBy,
      startDate,
      endDate,
      sortDirection,
      ...restDto
    } = dto;

    const filter: Partial<
      BasicQueryFilterWithFilter<Prisma.TransactionFindManyArgs<DefaultArgs>>
    > = {
      where: { userId: userId, ...restDto },
    };

    if (sortBy) {
      filter.orderBy = { [sortBy]: sortDirection };
    }
    const paginate = createPaginator({ perPage, page });
    const paginated = await paginate<
      Transaction,
      Prisma.TransactionFindManyArgs
    >(this.prisma.transaction, filter, { page });
    return paginated;
    // return [{ id, ...dto }] as unknown as TransactionEntity[];
  }
}
