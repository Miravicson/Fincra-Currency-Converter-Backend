import { ApiProperty } from '@nestjs/swagger';

export class ResponseErrorEntity {
  @ApiProperty({
    description: 'Error message describing the validation failure',
    example: 'Error occurred for one or more fields',
  })
  message: string;

  @ApiProperty({
    description: 'Indicates whether the request was successful',
    example: false,
  })
  status: boolean;

  constructor(data: Partial<ResponseErrorEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
