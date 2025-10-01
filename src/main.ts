import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from '@utils/configureApp';
import { Logger as NestLogger } from '@nestjs/common';
import { AppConfig } from './config/app.config';
import { SwaggerConfig } from './config/swagger.config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  configureApp(app);
  const appConfig = app.get<AppConfig>(AppConfig);
  const swaggerConfig = app.get(SwaggerConfig);

  await app.listen(appConfig.port, appConfig.hostname);
  const logger = new NestLogger('Bootstrap', {});
  logger.log(`App listening at http://localhost:${appConfig.port}`);
  logger.log(
    `Documentation is found at http://localhost:${appConfig.port}/${swaggerConfig.path}`,
  );
}

bootstrap();
