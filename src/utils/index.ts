import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';
import * as randomString from 'randomstring';
import { createHash, randomBytes } from 'node:crypto';
import ms, { StringValue } from './ms';
import slugify from 'slugify';
import { parsePhoneNumber } from 'libphonenumber-js/max';
import { BadRequestException } from '@nestjs/common';
import { DEFAULT_COUNTRY_CODE } from '@common/constant';
import * as crypto from 'crypto';
import * as fsPromises from 'fs/promises';
import { ValidationError } from 'class-validator';
import { Result } from '@/utils/types';

import { Response } from 'express';

export const roundsOfHashing = 10;

export const hashPassWord = (password: string): Promise<string> => {
  return bcrypt.hash(password, roundsOfHashing);
};

export const startOfDay = (dateTime: Date): Date => {
  return DateTime.fromJSDate(dateTime).startOf('day').toJSDate();
};

export const endOfDay = (dateTime: Date): Date => {
  return DateTime.fromJSDate(dateTime).endOf('day').toJSDate();
};

export const randomPassword = () => {
  return randomString.generate({
    length: 8,
    charset: ['alphanumeric', '-'],
  });
};

/**
 * Passwords will contain at least 1 upper case letter
 * Passwords will contain at least 1 lower case letter
 * Passwords will contain at least 1 number or special character
 * There is no length validation (min, max) in this regex!
 * @returns RegExp
 */
export function getPasswordRegex(): RegExp {
  return new RegExp('^(?=.*\\d)(?=.*\\W)(?=.*[A-Z])(?=.*[a-z])[^.\\n]*$');
}

/**
 *
 * @param token string token to hash
 * @returns string hashed token
 */
export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function genTokenAndHash(): { token: string; hashedToken: string } {
  const token = randomBytes(32).toString('hex') + randomPassword();
  const hashedToken = hashToken(token);
  return { token, hashedToken };
}

export const dateFromUnitTime = (time: StringValue) => {
  const secondsFromTimeString = ms(time);
  return DateTime.now()
    .plus({ milliseconds: secondsFromTimeString })
    .toJSDate();
};

export function createSlug(input: string) {
  return slugify(input);
}

export function aWeekBefore(date: Date): Date {
  return DateTime.fromJSDate(date).minus({ week: 1 }).toJSDate();
}

export function aDayBefore(date: Date) {
  return DateTime.fromJSDate(date).minus({ day: 1 }).toJSDate();
}

export function anHourBefore(date: Date) {
  return DateTime.fromJSDate(date).minus({ hour: 1 }).toJSDate();
}

export function formatDateReadable(date: Date) {
  return DateTime.fromJSDate(date).toLocaleString({
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
export function getReadableDateTime(date: Date) {
  return DateTime.fromJSDate(date).toFormat("D':'T");
}

export function isFutureDate(date: Date): boolean {
  return DateTime.fromJSDate(date) > DateTime.now();
}

export function formatDateRelative(date: Date) {
  return DateTime.fromJSDate(date).toRelative();
}

export function normalizeNigerianPhoneNumber(
  validNGPhoneNumber: string,
): string {
  try {
    const phoneNumber = parsePhoneNumber(
      validNGPhoneNumber,
      DEFAULT_COUNTRY_CODE,
    );
    return phoneNumber.formatNational().replaceAll(' ', '');
  } catch (_error: any) {
    throw new BadRequestException('Invalid phone number');
  }
}

export function isObject(object: any) {
  if (!object) return false;
  return typeof object === 'object' && !Array.isArray(object);
}

export function convertToDays(dateOfBirth: Date) {
  return Math.floor(
    DateTime.now().diff(DateTime.fromJSDate(dateOfBirth), 'days').days,
  );
}

export function getAppointmentDateFromAbsoluteDays({
  absoluteDays,
  hour,
  minutes,
}: {
  absoluteDays: number;
  hour: number;
  minutes: number;
}): Date {
  return DateTime.now()
    .plus({ day: absoluteDays })
    .set({ hour, minute: minutes })
    .toJSDate();
}

export function stringToBoolean(item: string | boolean) {
  if (typeof item === 'boolean') return item;
  return ['1', 'true'].includes(item);
}

export function choice<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('Array cannot be empty');
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export const maskSensitiveHeaderFields = (
  headers: Record<string, string>,
): Record<string, string> => {
  const maskedHeaders: Record<string, string> = { ...headers };
  if (maskedHeaders.authorization) {
    const auth: string =
      maskedHeaders.authorization.trim().split(/\s+/).pop() || '';
    maskedHeaders.authorization =
      'Bearer ' +
      auth.replace(
        /ey.+/gi,
        auth.slice(0, 10) + '*'.repeat(30) + auth.slice(-10),
      );
  }
  return maskedHeaders;
};

export const maskSensitiveBodyFields = (
  body: Record<string, any>,
): Record<string, any> => {
  const maskedBody: Record<string, any> = { ...body };
  if (body.password) {
    maskedBody.password = '******************';
  }
  return maskedBody;
};

export const twelveHourFormat = (hour: number): string => {
  const meridian: string = hour >= 12 ? 'pm' : 'am';
  const twelveHour: number =
    meridian === 'pm' && hour !== 12 ? hour - 12 : hour;
  return `${twelveHour}${meridian}`;
};

export const sentenceCase = (sentence: string) => {
  const sentenceSplit = sentence.split(/\s+/);
  return sentenceSplit
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
    .join(' ');
};

export const filterObject = <T extends Record<string, any>>(
  obj: T,
): Partial<T> => {
  const partialObject: Partial<T> = {};
  Object.keys(obj).forEach((key: keyof T) => {
    if (obj[key] !== undefined) {
      partialObject[key] = obj[key];
    }
  });
  return partialObject;
};

export const englishList = (list: string[]): string => {
  list = list
    .map((value: string) => value.trim())
    .filter((value: string) => value);
  if (list.length < 2) {
    return list.join(', ');
  }
  const lastElem: string | undefined = list.pop()?.trim();
  return list.join(', ') + `and ${lastElem}`;
};

export const md5Hash = (value: any) => {
  return crypto.createHash('md5').update(JSON.stringify(value)).digest('hex');
};

export const toBoolean = (value: any): boolean =>
  value === 'true' ||
  value === '1' ||
  value === 1 ||
  value === true ||
  value === 'TRUE';

export const jsonParseSilent = (value: string, defaultValue?: any): any => {
  try {
    return JSON.parse(value);
  } catch (err: any) {
    return defaultValue || value;
  }
};

export const first = <T>(entries: T[]): T | undefined =>
  entries.length ? (entries[0] as T) : undefined;

export const last = <T>(entries: T[]): T | undefined =>
  entries.length ? entries[entries.length - 1] : undefined;

export const uuid = (): string => crypto.randomUUID().replace(/-/g, '');

export const setCORSHeaders = (response: Response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set(
    'Access-Control-Allow-Headers',
    'Authorization,Content-Type,Content-Length,Cache-Control',
  );
  response.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
  );
  response.set('Access-Control-Allow-Credentials', 'true');
};

export const setCacheHeaders = (response: Response) => {
  response.set('Cache-Control', 'no-cache, no-store, must-revalidate');
};

export const roundToTwoDecimalPlaces = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const convertToKobo = (num: number) =>
  Math.round(roundToTwoDecimalPlaces(num)) * 100;

export const escapeRegex = (entry: string): string => {
  return entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fsPromises.access(path, fsPromises.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export function formatValidationErrors(
  errors: ValidationError[],
): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};
  for (const error of errors) {
    const errorMessages: string[] = [];
    if (error.children && error.children.length) {
      const parentProperty: string = error.property;
      const childrenErrors: Record<string, string[]> = formatValidationErrors(
        error.children,
      );
      Object.keys(childrenErrors).forEach((childProperty: string) => {
        formattedErrors[parentProperty + `.` + childProperty] =
          childrenErrors[childProperty];
      });
    } else if (error.constraints) {
      Object.keys(error.constraints).forEach(
        (constraintKey) =>
          error.constraints &&
          errorMessages.push(error.constraints[constraintKey]),
      );
      formattedErrors[error.property] = errorMessages;
    }
  }
  return formattedErrors;
}

export const tryCatch = <T, E = Error>(
  arg: Promise<T> | (() => T),
): Result<T, E> | Promise<Result<T, E>> => {
  if (typeof arg === 'function') {
    try {
      const data = (arg as () => T)();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as E };
    }
  }

  return (arg as Promise<T>)
    .then((data) => ({ data, error: null }))
    .catch((error) => ({ data: null, error: error as E }));
};
