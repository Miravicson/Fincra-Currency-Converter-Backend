import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationMeta } from './dto/paginated-output.dto';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(model, PaginationMeta),
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
            nullable: false,
          },
          meta: {
            $ref: getSchemaPath(PaginationMeta),
            nullable: false,
          },
        },
      },
    }),
  );
};
