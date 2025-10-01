import { PrismaClient } from '@prisma/client';
import { createMock } from '@golevelup/ts-jest';
import { mockDeep } from 'jest-mock-extended';
import { InjectionToken } from '@nestjs/common';
import { PrismaService } from '@my-prisma/prisma.service';

export const customCreateMock = (token?: InjectionToken) => {
  return token === PrismaService ? mockDeep<PrismaClient>() : createMock(token);
};
