import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { AppConfig } from '@/config/app.config';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: (appConfig: AppConfig) => {
        const isProduction = appConfig.environment === 'production';

        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: false,
                    colorize: true,
                    translateTime: 'HH:MM:ss.l',
                    ignore: 'pid,hostname',
                  },
                },
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
      inject: [AppConfig],
    }),
  ],
})
export class LoggerModule {}
