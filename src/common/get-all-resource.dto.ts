import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SortOrderEnum } from './constant';
import { IntersectionType } from '@nestjs/swagger';
import { DateRangeFilterDto } from '@common/date-range-filter.dto';

export class GetAllResourceDto<T> extends IntersectionType(DateRangeFilterDto) {
  @IsEnum(SortOrderEnum)
  @IsOptional()
  sortDirection?: SortOrderEnum = SortOrderEnum.DESC;

  @IsString()
  @IsOptional()
  fields?: string;

  @IsString()
  @IsOptional()
  sortBy?: keyof NonNullable<T>;

  @IsNumber()
  @IsOptional()
  @Type(() => Number || 1)
  @Min(0)
  page?: number = 1;

  @IsNumber()
  @Type(() => Number || 10)
  @Min(1)
  @IsOptional()
  perPage?: number = 10;
}
