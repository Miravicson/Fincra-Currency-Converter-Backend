import { UserWithProfile } from '@/users/types';
import { INestApplication } from '@nestjs/common';
import { Request, Response } from 'express';

export type Plug = (app: INestApplication) => INestApplication;

export type RequestCtx = {
  request: Request;
  response: Response;
};

interface ProfileWithHospital extends NonNullable<UserWithProfile['profile']> {
  hospitalId: string;
}
export interface UserIsRegisteredToHospital extends UserWithProfile {
  profile: ProfileWithHospital;
}

export type Success<T> = {
  data: T;
  error: null;
};

export type Failure<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;
