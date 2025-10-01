import { Configuration, Value } from '@itgorillaz/configify';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@Configuration()
export class MailerModuleAuthConfig {
  @IsOptional()
  @IsString()
  @Value('EMAIL_USERNAME')
  user?: string;

  @IsString()
  @IsOptional()
  @Value('EMAIL_PASSWORD')
  pass: string;
}

@Configuration()
export class MailerModuleDefaultsConfig {
  @IsString()
  @Value('EMAIL_FROM')
  from: string;
}

@Configuration()
export class MailerModuleTransportConfig {
  @IsString()
  @Value('EMAIL_HOST', { default: 'localhost' })
  host: string;

  @IsNumber()
  @Value('EMAIL_PORT', { default: 1025, parse: Number.parseInt })
  port: number;

  auth: MailerModuleAuthConfig;
}

export class MailerModuleConfig {
  transport: MailerModuleTransportConfig;
  defaults: MailerModuleDefaultsConfig;

  static configProvider = {
    provide: MailerModuleConfig,
    useFactory: (
      mailerTransportConfig: MailerModuleTransportConfig,
      mailerModuleAuthConfig: MailerModuleAuthConfig,
      mailerModuleDefaultsConfig: MailerModuleDefaultsConfig,
    ) => {
      const transport = mailerTransportConfig;
      transport.auth = mailerModuleAuthConfig;
      const defaults = mailerModuleDefaultsConfig;

      return {
        transport,
        defaults,
      };
    },
    inject: [
      MailerModuleTransportConfig,
      MailerModuleAuthConfig,
      MailerModuleDefaultsConfig,
    ],
  };
}
