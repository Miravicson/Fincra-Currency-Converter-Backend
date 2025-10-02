import { PaginationMeta } from '@common/dto/pagination-meta.dto';

export class PaginatedOutputDto<T> {
  data: T[];
  meta: PaginationMeta;
}
