import { DefaultArgs } from '@prisma/client/runtime/client';
import { Prisma, PrismaClient } from '@prisma/client';

export type BasicQueryFilterKeys =
  | 'select'
  | 'include'
  | 'where'
  | 'orderBy'
  | 'cursor'
  | 'take'
  | 'skip'
  | 'distinct';

export type BasicQueryFilter = {
  [key in BasicQueryFilterKeys]?: any;
};

export type QueryFeaturesRetType = BasicQueryFilter & {
  where: Required<BasicQueryFilter['where']>;
};

export type BasicQueryFilterWithFilter<Q extends BasicQueryFilter> = Omit<
  Q,
  'where'
> & {
  where: NonNullable<Q['where']>;
};

export type PrismaTransactionClient = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;
