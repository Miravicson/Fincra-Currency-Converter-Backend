import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({
    example: 1,
    description:
      'Current page number (can be a number or a string, depending on pagination type)',
  })
  _page: number | string;

  @ApiProperty({
    example: 20,
    description: 'Number of items requested per page',
  })
  _perPage: number;

  @ApiProperty({
    example: 15,
    description: 'Actual number of items returned in this page',
  })
  _realPerPage: number;

  @ApiProperty({
    example: true,
    description: 'Indicates if there are more items after this page',
  })
  _hasMore: boolean;

  @ApiProperty({
    example: { createdAt: -1 },
    description:
      'Sorting order applied to the query, as a key-value pair of field and direction',
  })
  _sort: Record<string, number>;

  @ApiProperty({
    example: 15,
    description: 'Number of items in the current page',
  })
  _pageItemsCount: number;
}
