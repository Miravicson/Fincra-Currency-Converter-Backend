import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { FieldValidationErrors } from '@common/entities/field-validation-error.response.entity';

@ApiExtraModels(FieldValidationErrors)
export class ValidationErrorEntity {
  @ApiProperty({
    description: 'Error message describing the validation failure',
    example: 'Validation failed for one or more fields',
  })
  message: string;

  @ApiProperty({
    description: 'Detailed validation errors per field',
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(FieldValidationErrors) },
    example: {
      email: { errors: ['Email must be valid', 'Email is required'] },
      password: { errors: ['Password must be at least 8 characters'] },
    },
  })
  validationError: Record<string, FieldValidationErrors>;

  @ApiProperty({
    description: 'Indicates whether the request was successful',
    example: false,
  })
  status: boolean;

  constructor(data: Partial<ValidationErrorEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
