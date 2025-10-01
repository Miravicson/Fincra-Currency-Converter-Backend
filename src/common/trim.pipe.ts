import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { isObject } from '@utils/index';

export class TrimPipe implements PipeTransform {
  private trimString(value: any) {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }
  private trimValue(value: any) {
    if (isObject(value)) {
      return this.trim(value);
    } else {
      return this.trimString(value);
    }
  }

  private trim(values: any) {
    Object.keys(values).forEach((key) => {
      if (key !== 'password') {
        values[key] = this.trimValue(values[key]);
      }
    });
    return values;
  }

  transform(values: any, metadata: ArgumentMetadata) {
    const { type } = metadata;

    if (isObject(values) && type === 'body') {
      return this.trim(values);
    }

    return values;
  }
}
