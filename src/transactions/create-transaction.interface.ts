import { Account, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

export interface CreateTransaction {
  fromAccount: Account;
  toAccount: Account;
  amount: Decimal;
  userId: User['id'];
}
