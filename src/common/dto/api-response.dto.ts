import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '@common/dto/pagination-meta.dto';

export class AppApiResponse<T> {
  @ApiProperty()
  status: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: T | any;

  @ApiProperty()
  validationError?: Record<string, any>;

  @ApiProperty()
  meta?: PaginationMeta;
}
