import { PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';
import { Account, Transaction, User, UserProfile } from '@prisma/client';

export type Action = Lowercase<keyof typeof Action>;

export const Action = {
  Manage: 'manage',
  Create: 'create',
  Read: 'read',
  Update: 'update',
  Delete: 'delete',
  Impersonate: 'impersonate',
} as const;

export type AppSubjects =
  | 'all'
  | Subjects<{
      User: User;
      UserProfile: UserProfile;
      Account: Account;
      Transactions: Transaction;
    }>;
export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>;
