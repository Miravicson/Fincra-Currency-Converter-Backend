// export class PaginationMeta {
//   total: number;
//   lastPage: number;
//   currentPage: number;
//   perPage: number;
//   prev: number | null;
//   next: number | null;
// }
import { PaginationMeta } from '@common/dto/pagination-meta.dto';

export class PaginatedOutputDto<T> {
  data: T[];
  meta: PaginationMeta;
}
