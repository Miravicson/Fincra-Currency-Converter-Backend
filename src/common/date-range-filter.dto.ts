import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class DateRangeFilterDto {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  readonly startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  readonly endDate?: Date;
}
