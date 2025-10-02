import { Decimal } from '@prisma/client/runtime/client';

export interface ExchangerInput {
  fromCurrency: string;
  toCurrency: string;
  amount: Decimal;
}
export interface ExchangerResponse {
  fromCurrency: string;
  toCurrency: string;
  initialAmount: Decimal;
  convertedAmount: Decimal;
  exchangeRate: Decimal;
}

export interface ExchangerService {
  convert(options: ExchangerInput): Promise<ExchangerResponse>;
}
