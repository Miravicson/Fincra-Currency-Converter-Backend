import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExchangeRateHttpResponse } from './exchang-rate-http-response.interface';

import { firstValueFrom } from 'rxjs';
import * as path from 'node:path';
import { AppConfig } from '@/config/app.config';
import { tryCatch } from '@/utils';

@Injectable()
export class ExchangeRateHttpService implements OnModuleInit {
  private apiKey!: string;
  private _exchangeUrl!: string;
  private logger = new Logger(this.constructor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfig: AppConfig,
  ) {}
  onModuleInit() {
    this.apiKey = this.appConfig.exchangeRateServiceApiKey;
  }

  private set exchangeUrlCode(exchangeCode: string) {
    this.exchangeURL = path
      .join('/v6', this.apiKey, 'latest', exchangeCode)
      .toString();
  }

  private set exchangeURL(url: string) {
    this._exchangeUrl = url;
  }

  private get exchangeURL(): string {
    return this._exchangeUrl;
  }

  async fetchExchangeRateForBaseCode(
    baseCode: string,
  ): Promise<ExchangeRateHttpResponse> {
    this.exchangeUrlCode = baseCode;
    this.logger.log(this.exchangeURL);
    const { data, error } = await tryCatch(
      firstValueFrom(
        this.httpService.get<ExchangeRateHttpResponse>(this.exchangeURL),
      ),
    );

    if (error) {
      throw error;
    }

    return data.data;
  }
}
