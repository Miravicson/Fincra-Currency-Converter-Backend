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
