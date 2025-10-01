import { ApiProperty } from '@nestjs/swagger';

export class FieldValidationErrors {
  @ApiProperty({
    type: [String],
    description: 'List of validation errors for this field',
    example: ['Email must be valid', 'Email is required'],
  })
  errors: string[];
}

