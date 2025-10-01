import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';

import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const prismaClientErrorCodeStatusMap = {
  P2002: {
    httpCode: HttpStatus.CONFLICT,
    errorMessage: 'This entity already exists',
  },
  P2025: {
    httpCode: HttpStatus.NOT_FOUND,
    errorMessage: 'This entity does not exist',
  },
};

type HandledPrismaClientErrorCode = keyof typeof prismaClientErrorCodeStatusMap;

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private exception: Prisma.PrismaClientKnownRequestError;
  private host: ArgumentsHost;

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    console.error(exception.code);
    console.error(exception.meta);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    this.buildErrorResponse(exception.code, response, message);
  }

  private buildErrorResponse(
    prismaClientErrorCode: string,
    response: Response,
    message: string,
  ) {
    const status =
      prismaClientErrorCodeStatusMap[
        prismaClientErrorCode as HandledPrismaClientErrorCode
      ];

    if (status) {
      response.status(status.httpCode).json({
        statusCode: status.httpCode,
        message: status.errorMessage ?? message,
      });
    } else {
      super.catch(this.exception, this.host);
    }
  }
}
