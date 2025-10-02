import { applyDecorators, HttpCode, HttpStatus, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse as SwaggerApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginationMeta } from './dto/pagination-meta.dto';

type PrimitiveCtor = StringConstructor | NumberConstructor | BooleanConstructor;
type ModelType = Type<unknown> | PrimitiveCtor | null;

interface CustomApiResponseOptions {
  isArray?: boolean;
  type?: ModelType;
  paginated?: boolean;
  status?: HttpStatus;
}

/**
 * Swagger + runtime response decorator for ApiResponse<T>
 * - Defaults to 200 OK
 * - Adds pagination meta only when paginated = true
 * - Syncs @HttpCode with @ApiResponse
 * - Excludes `data` when model/type is null
 * - Excludes all body properties when status = 204 (No Content)
 */
export const CustomApiResponse = (options: CustomApiResponseOptions = {}) => {
  const {
    isArray = false,
    type: model = null,
    paginated = false,
    status = HttpStatus.OK,
  } = options;

  const isPrimitive = model === String || model === Number || model === Boolean;
  const isClass = !!model && typeof model === 'function' && !isPrimitive;

  let dataSchema: Record<string, any> | null = null;
  let modelName = '';

  // Do not generate body schema for 204
  if (status !== HttpStatus.NO_CONTENT && model) {
    if (isPrimitive) {
      const primitiveType =
        model === String ? 'string' : model === Number ? 'number' : 'boolean';

      dataSchema = isArray
        ? { type: 'array', items: { type: primitiveType }, nullable: true }
        : { type: primitiveType, nullable: true };

      modelName =
        primitiveType.charAt(0).toUpperCase() + primitiveType.slice(1);
    } else if (isClass) {
      dataSchema = isArray
        ? {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
            nullable: true,
          }
        : { $ref: getSchemaPath(model), nullable: true };

      modelName = (model as { name: string }).name;
    }
  }

  // Base response properties
  const properties: Record<string, any> = {};

  if (status !== HttpStatus.NO_CONTENT) {
    properties.status = {
      type: 'boolean',
      example: true,
      description: 'Indicates if the operation was successful',
    };
    properties.message = {
      type: 'string',
      example: 'Operation completed successfully',
      description: 'A descriptive message about the result',
    };

    if (dataSchema) {
      properties.data = dataSchema;
    }

    if (paginated) {
      properties.meta = {
        description:
          'Pagination metadata (either offset-based or cursor-based)',
        oneOf: [
          {
            type: 'object',
            required: ['offsetPagination'],
            properties: {
              offsetPagination: { $ref: getSchemaPath(PaginationMeta) },
            },
          },
          {
            type: 'object',
            required: ['cursorPagination'],
            properties: {
              cursorPagination: { $ref: getSchemaPath(PaginationMeta) },
            },
          },
        ],
      };
    }
  }

  const decorators: any[] = [];

  if (isClass && status !== HttpStatus.NO_CONTENT) {
    decorators.push(ApiExtraModels(model as Type<unknown>));
  }
  if (paginated && status !== HttpStatus.NO_CONTENT) {
    decorators.push(ApiExtraModels(PaginationMeta));
  }

  const title =
    status === HttpStatus.NO_CONTENT
      ? 'ApiResponseNoContent'
      : model
        ? `ApiResponseOf${modelName}${isArray ? 'Array' : ''}`
        : 'ApiResponse';

  // required fields should exclude `data` if no model or if 204
  const requiredFields =
    status === HttpStatus.NO_CONTENT ? [] : ['status', 'message'];
  if (dataSchema) {
    requiredFields.push('data');
  }

  decorators.push(
    HttpCode(status),
    SwaggerApiResponse({
      status,
      schema:
        status === HttpStatus.NO_CONTENT
          ? { description: 'No content' } // no body schema
          : {
              title,
              type: 'object',
              required: requiredFields,
              properties,
            },
    }),
  );

  return applyDecorators(...decorators);
};

