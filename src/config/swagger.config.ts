import { Configuration, Value } from '@itgorillaz/configify';
import { stringToBoolean } from '@utils/index';
import { IsBoolean, IsString } from 'class-validator';

@Configuration()
export class SwaggerConfig {
  @IsBoolean()
  @Value('SWAGGER_ENABLED', {
    default: true,
    parse: stringToBoolean,
  })
  enabled: boolean;

  @IsString()
  @Value('SWAGGER_TITLE', { default: 'Fincra Converter' })
  title: string;

  @IsString()
  @Value('SWAGGER_DESCRIPTION', { default: 'Convert your currency' })
  description: string;

  @IsString()
  @Value('SWAGER_DOCUMENTATION_VERSION', { default: '1.0' })
  version: string;

  @IsString()
  @Value('SWAGGER_PATH', { default: 'swagger' })
  path: string;

  @IsString()
  @Value('SWAGGER_PASSWORD', { default: 'password' })
  password: string;
}
