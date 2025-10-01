import { PaginatedOutputDto } from '@common/dto/paginated-output.dto';
import { PaginatedResult } from 'prisma-pagination';

type Constructor<T> = new (data: Partial<T>) => T;
type NestedEntities<T> = Partial<Record<keyof T, Constructor<any>>>;

export abstract class BaseEntity<T> {
  constructor(
    data: Partial<T> | null,
    nestedEntities: NestedEntities<T> = {} as NestedEntities<T>,
  ) {
    if (data !== null) {
      Object.assign(this, data);

      // Instantiate nested entities
      for (const key of Object.keys(nestedEntities) as (keyof T)[]) {
        if (data[key] !== undefined) {
          const EntityClass = nestedEntities[key] as Constructor<T[keyof T]>;

          (this as any)[key] = Array.isArray(data[key])
            ? (data[key] as any[]).map((item) => new EntityClass(item))
            : new EntityClass(data[key] as any);
        }
      }
    }
  }

  static one<T extends BaseEntity<T>>(
    this: new (data: Partial<T> | null) => T | null,
    entity: T | null,
  ): T | null {
    return new this(entity);
  }

  static many<T extends BaseEntity<T>>(
    this: new (data: Partial<T>) => T,
    entities: T[],
  ): T[] {
    return entities.map((entity) => new this(entity));
  }

  static paginate<T extends BaseEntity<T>>(
    this: new (data: Partial<T>) => T,
    paginatedData: PaginatedResult<T>,
  ): PaginatedOutputDto<T> {
    const { data, meta } = paginatedData;
    return {
      data: data.map((item) => new this(item)),
      meta,
    };
  }
}
