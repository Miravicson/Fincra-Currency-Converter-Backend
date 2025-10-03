import { PrismaClientExceptionFilter } from '@my-prisma/prisma-client-exception/prisma-client-exception.filter';
import {
  ClassSerializerInterceptor,
  INestApplication,
  RequestMethod,
  ValidationPipe,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';

import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as lodashFp from 'lodash/fp';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Plug } from './types';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { TrimPipe } from '@common/trim.pipe';
import { NextFunction, Request, Response } from 'express';
import { AppConfig } from '@/config/app.config';
import { SwaggerConfig } from '@/config/swagger.config';
import { SecurityConfig } from '@/config/security.config';
import { useContainer, ValidationError } from 'class-validator';
import { ValidationException } from '@common/validation.exception';
import { formatValidationErrors } from '@utils/index';
import { ValidationExceptionFilter } from '@common/validation-error.filter';
import { AppModule } from '@/app.module';

export const defaultConfigurationPlug = (
  app: INestApplication,
): INestApplication => {
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      transform: true,
      whitelist: true,
      validationError: {
        target: true,
        value: true,
      },
      exceptionFactory(errors: ValidationError[]) {
        const formattedErrors: Record<string, string[]> =
          formatValidationErrors(errors);
        return new ValidationException(formattedErrors);
      },
    }),
    new TrimPipe(),
  );

  // enable DI for class-validator
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(cookieParser());
  app.useGlobalFilters(new ValidationExceptionFilter());
  return app;
};

export const securityPlug = (app: INestApplication): INestApplication => {
  const helmetConfig = {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    },
  };
  const securityConf = app.get<SecurityConfig>(SecurityConfig);

  /**
   * Refer to this article https://expressjs.com/en/resources/middleware/cors.html#configuration-options
   * and this https://stackoverflow.com/questions/46288437/set-cookies-for-cross-origin-requests to learn more about configuring cors
   */

  const corsOptions: CorsOptions = {
    origin: securityConf.corsOrigin.split(','),
    credentials: securityConf.allowSecurityCredentials,
  };

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(helmet.contentSecurityPolicy(helmetConfig));
  app.enableCors(corsOptions);

  return app;
};

export const globalUrlConfigPlug = (
  app: INestApplication,
): INestApplication => {
  const appConfig = app.get<AppConfig>(AppConfig);
  const swaggerConfig = app.get<SwaggerConfig>(SwaggerConfig);
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(app.get(HttpAdapterHost)),
  );
  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.ALL }, swaggerConfig.path],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  if (swaggerConfig.enabled) {
    app.use(
      ['/swagger', '/swagger/yaml', '/swagger/json'],
      (req: Request, res: Response, next: NextFunction) => {
        if (appConfig.environment === 'development') {
          next();
        } else {
          const middleware = basicAuth({
            challenge: true,
            users: { admin: swaggerConfig.password },
          });
          middleware(req, res, next);
        }
      },
    );
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory(_controllerKey, methodKey) {
        return methodKey;
      },
    });

    // Remove default responses globally
    Object.keys(document.paths).forEach((path) => {
      Object.keys(document.paths[path]).forEach((method) => {
        // @ts-expect-error untyped
        const operation = document.paths[path][method];
        if (operation.responses && operation.responses.default) {
          delete operation.responses.default;
        }
      });
    });

    SwaggerModule.setup(swaggerConfig.path, app, document, {
      jsonDocumentUrl: 'swagger/json',
      yamlDocumentUrl: 'swagger/yaml',
      explorer: false,
      customCss: /*css*/ `
        .swagger-ui .opblock .opblock-summary-operation-id {
          font-size: 14px;
          color: rebeccapurple;
          line-break: normal;
          white-space: nowrap;
          margin-right: 10px;
        }
      `,
      customfavIcon: 'https://v2.bloomers.ng/favicon.ico',
      swaggerOptions: {
        displayOperationId: true,
        persistAuthorization: true,
      },
    });
  }
  return app;
};

export const configureApp = (app: INestApplication): INestApplication => {
  const plugs: Plug[] = [
    defaultConfigurationPlug,
    globalUrlConfigPlug,
    securityPlug,
  ];
  return lodashFp.pipe(plugs)(app);
};
