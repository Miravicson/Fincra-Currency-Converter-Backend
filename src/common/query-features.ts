import { isNil, omitBy } from 'lodash/fp';
import { GetAllResourceDto } from './get-all-resource.dto';

import { BasicQueryFilter, BasicQueryFilterWithFilter } from './types';

import { Logger } from '@nestjs/common';
import { endOfDay, startOfDay } from '@/utils';

export class QueryFeatures<M, Q extends BasicQueryFilter> {
  logger = new Logger(this.constructor.name);
  constructor(
    private dto: GetAllResourceDto<M> & Record<string, any> & Q['where'],
  ) {}

  private clean(item: Record<string, unknown>) {
    return omitBy(isNil, item);
  }

  updateDto<D extends GetAllResourceDto<M> & Record<string, any> & Q['where']>(
    options: D,
  ): QueryFeatures<M, Q> {
    this.dto = { ...this.dto, ...options };
    return this;
  }

  where(): BasicQueryFilterWithFilter<Q>['where'] {
    const {
      startDate,
      sortBy,
      endDate,
      page,
      perPage,
      sortDirection,
      fields,
      ...entityFilters
    } = this.dto;

    const where: Q['where'] = { ...entityFilters };
    if (startDate && endDate) {
      where['createdAt'] = {
        lte: endOfDay(endDate),
        gte: startOfDay(startDate),
      };
    } else if (startDate) {
      where['createdAt'] = {
        gte: startOfDay(startDate),
      };
    } else if (endDate) {
      where['createdAt'] = {
        lte: endOfDay(endDate),
      };
    }

    return where;
  }

  orderBy() {
    const { sortDirection, sortBy } = this.dto;
    if (sortBy) {
      return { [sortBy]: sortDirection };
    }
    return {
      createdAt: sortDirection,
    };
  }

  build(): BasicQueryFilterWithFilter<Q> {
    const where = this.where() ?? {};
    const orderBy = this.orderBy();

    const filter = this.clean({
      where,
      orderBy,
    }) as BasicQueryFilterWithFilter<Q>;
    this.logger.verbose(`Filter: ${JSON.stringify(filter, null, 2)}`);
    return filter;
  }
}
