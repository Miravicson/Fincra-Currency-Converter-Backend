import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export type Environment = Lowercase<keyof typeof Environment>;

export const Environment = {
  Development: 'development',
  Production: 'production',
  Test: 'test',
  Provision: 'provision',
} as const;

@Configuration()
export class AppConfig {
  @Value('NODE_ENV', { default: Environment.Development })
  environment: Environment;

  @IsNumber()
  @Value('PORT', { parse: Number.parseInt, default: 3000 })
  port: number;

  @IsNotEmpty()
  @IsString()
  @Value('APP_HOST_NAME', { default: '0.0.0.0' })
  hostname: string;

  @IsNotEmpty()
  @IsString()
  @Value('EXCHANGE_RATE_URL')
  exchangeRateServiceBaseUrl: string;

  @IsNotEmpty()
  @IsString()
  @Value('EXCHANGE_RATE_API_KEY')
  exchangeRateServiceApiKey: string;
}
