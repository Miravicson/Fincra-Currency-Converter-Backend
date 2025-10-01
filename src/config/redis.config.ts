import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@Configuration()
export class RedisConfig {
  @IsString()
  @IsNotEmpty()
  @Value('REDIS_HOST', { default: 'localhost' })
  host: string;

  @IsNumber()
  @IsNotEmpty()
  @Value('REDIS_PORT', { parse: Number.parseInt, default: 6379 })
  port: number;

  @IsString()
  @IsNotEmpty()
  @Value('REDIS_USERNAME', { default: 'default' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @Value('REDIS_PASSWORD')
  password: string;
}
