import { Request } from 'express';
import { User } from '@prisma/client';
import { UserEntity } from '@/users/entities/user.entity';

export type SnakeToHyphen<T extends string> =
  T extends `${infer First}_${infer Rest}`
    ? `${Lowercase<First>}-${SnakeToHyphen<Rest>}`
    : Lowercase<T>;

export type PascalToKebab<T extends string> =
  T extends `${infer First}${infer Rest}`
    ? `${First extends Uppercase<First> ? '-' : ''}${Lowercase<First>}${PascalToKebab<Rest>}`
    : '';

export const SetMetadataKeyEnum = {
  PERMISSIONS: 'permissions',
  ROLES: 'roles',
  CHECK_POLICIES: 'check-policies',
  CHECK_ABILITIES: 'check-abilities',
} as const;
export interface AccessTokenPayload {
  sub: number;
  impersonatedSub?: number;
  iat: number;
  exp?: number;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthenticatedUser extends User {
  isImpersonated?: boolean;
  impersonatedBy?: number;
}

export interface AuthenticatedRequest extends Request {
  user: UserEntity;
  cookies: Record<string, string>;
}

export interface JWTPayload {
  sub: number;
  iat?: number;
  exp?: number;
}
