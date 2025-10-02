import { Injectable } from '@nestjs/common';

export interface ExchangeRateHostConvertOptions {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}
export interface ExchangeRateHostConvertResponse {
  fromCurrency: string;
  toCurrency: string;
  initialAmount: number;
  convertedAmount: number;
  exchangeRate: number;
}

@Injectable()
export class ExchangeRateHostService {
  async convert(
    options: ExchangeRateHostConvertOptions,
  ): Promise<ExchangeRateHostConvertResponse> {
    return {} as ExchangeRateHostConvertResponse;
  }
}
