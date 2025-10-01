import { ApiProperty } from '@nestjs/swagger';

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
  meta?: Record<string, any>;
}
