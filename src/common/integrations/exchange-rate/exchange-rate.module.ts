import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRateHttpService } from './exchange-rate-http.service';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'nestjs-pino';
import {
  TestExchangeRateCommand,
  TestExchangeRateServiceCommand,
} from './exchange-rate.command';
import { AppConfig } from '@/config/app.config';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: (appConfig: AppConfig) => ({
        baseURL: appConfig.exchangeRateServiceBaseUrl,
      }),
      inject: [AppConfig],
    }),
    LoggerModule,
  ],
  providers: [
    ExchangeRateService,
    ExchangeRateHttpService,
    TestExchangeRateCommand,
    TestExchangeRateServiceCommand,
  ],
  controllers: [],
  exports: [ExchangeRateService],
})
export class ExchangeRateModule {}
