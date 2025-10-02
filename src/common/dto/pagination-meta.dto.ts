import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({
    example: 30,
    description: 'total number of items matching query',
  })
  total: number;

  @ApiProperty({
    example: 3,
    description: 'last page number',
  })
  lastPage: number;

  @ApiProperty({
    example: 2,
    description: 'Current page number',
  })
  currentPage: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items requested per page',
  })
  perPage: number;

  @ApiProperty({
    example: 1,
    description: 'Previous page number. Value will be null if at first page',
  })
  prev: number | null;

  @ApiProperty({
    example: 3,
    description: 'Next page number. Value will be null if at last page',
  })
  next: number | null;
}
