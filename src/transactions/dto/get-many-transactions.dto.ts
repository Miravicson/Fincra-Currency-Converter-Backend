import { GetAllResourceDto } from '@common/get-all-resource.dto';
import { TransactionFilterDto } from '@/transactions/dto/transaction-filter.dto';
import { IntersectionType } from '@nestjs/swagger';

export class GetManyTransactionsDto extends IntersectionType(
  GetAllResourceDto,
  TransactionFilterDto,
) {}
