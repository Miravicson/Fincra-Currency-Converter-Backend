import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/client';

export const DecimalToString = (decimalPlaces = 2) => {
  return applyDecorators(
    ApiProperty({ type: String }),
    Transform(({ value }: { value: Decimal | null }) => {
      if (!value) {
        return null;
      }
      if (typeof value === 'string')
        return new Decimal(value).toFixed(decimalPlaces);
      return value.toFixed(decimalPlaces);
    }),
  );
};
