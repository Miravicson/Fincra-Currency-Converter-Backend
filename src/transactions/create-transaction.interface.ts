import { Account, User } from '@prisma/client';

export interface CreateTransaction {
  fromAccount: Account;
  toAccount: Account;
  amount: number;
  userId: User['id'];
}
