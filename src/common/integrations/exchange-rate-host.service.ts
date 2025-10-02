import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';
import {
  ExchangerInput,
  ExchangerResponse,
  ExchangerService,
} from '@common/integrations/exchanger-service.interface';

@Injectable()
export class ExchangeRateHostService implements ExchangerService {
  async convert(options: ExchangerInput): Promise<ExchangerResponse> {
    throw new Error('Method not implemented.');
  }
}
