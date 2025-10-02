import { CountryCode } from 'libphonenumber-js/max';

export enum SortOrderEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export const DEFAULT_COUNTRY_CODE: CountryCode = 'NG';

export enum CacheManagerEnumCacheKey {
  DashboardAccounts = 'dashboard:accounts',
  DashboardRecentTransaction = 'dashboard:recentTransaction',
}
