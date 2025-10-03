import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { setCacheHeaders } from '@/utils';
import { AppApiResponse } from '@common/dto/api-response.dto';

const statusCodeMessages: Record<string, string> = {
  200: 'Success',
  201: 'Resource created',
  204: 'Accepted',
  400: 'Bad Request',
  401: 'Invalided authentication',
  403: 'You are not authorized',
  404: 'Not found',
  500: 'An error occurred',
  501: 'An error occurred',
  502: 'Service is unavailable',
  503: 'Service is unavailable',
};

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private logger = new Logger(ResponseInterceptor.name);
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<AppApiResponse<Record<string, any>>> {
    const response: Response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const statusCode: number = response.statusCode;

    setCacheHeaders(response);

    const message =
      statusCodeMessages[statusCode] ||
      (statusCode >= 200 && statusCode < 300 && 'Success');
    const responseObservable = next.handle().pipe(
      map((data) => {
        const resp: AppApiResponse<Record<string, any>> = {
          status: statusCode >= 200 && statusCode < 300,
          message:
            message ||
            (statusCode >= 400 && statusCode < 500
              ? 'Bad request'
              : 'An error occurred'),
        };
        // if data is already formatted, then send as is
        if (data && (data.message || data.data)) {
          const responseData: AppApiResponse<any> = Object.assign(resp, data);
          this.log(request, response, responseData);
          return responseData;
        } else if (typeof data === 'string') {
          //send string data as message
          resp.message = data;
        } else if (typeof data === 'boolean') {
          const responseBody: AppApiResponse<any> = {
            status: data,
            message: data ? statusCodeMessages['200'] : 'Request failed',
          };
          this.log(request, response, responseBody);
          return responseBody;
        } else {
          resp.data = data;
        }
        // format and send response
        this.log(request, response, resp);
        return resp;
      }),
    );

    return responseObservable;
  }

  protected log(_: any, response: any, body: AppApiResponse<any>) {
    // format and send response
    this.logger.log({
      body,
      statusCode: response.statusCode,
      headers: response.getHeaders(),
    });
  }
}
