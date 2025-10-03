import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from '@common/validation.exception';
import { setCORSHeaders } from '@/utils';

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationException.name);
  constructor() {}

  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    this.logger.error(exception);
    const response = ctx.getResponse<Response>();
    const statusCode = 400;
    const validationMessages = exception.getErrorMessages();
    let message: string = exception.message;
    if (Object.keys(validationMessages).length > 0) {
      message = validationMessages[Object.keys(validationMessages)[0]][0];
    }
    // setCORSHeaders(response);
    const apiResponse = {
      status: false,
      message: message || exception.message,
      validationError: validationMessages,
    };
    this.logger.log({
      body: apiResponse,
      statusCode,
      headers: response.getHeaders(),
    });

    response.status(statusCode).json(apiResponse);
  }
}
