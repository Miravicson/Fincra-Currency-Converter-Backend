import { Configuration, Value } from '@itgorillaz/configify';
import { stringToBoolean } from '@utils/index';
import { StringValue } from '@utils/ms';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

@Configuration()
export class SecurityConfig {
  @IsString()
  @IsNotEmpty()
  @Value('JWT_SECRET')
  jwtSecret: string;

  @IsString()
  @Value('JWT_EXPIRES_IN', { default: '1hr' }) //for units https://www.npmjs.com/package/ms
  jwtExpiresIn: StringValue;

  @IsString()
  @IsNotEmpty()
  @Value('REFRESH_TOKEN_SECRET')
  jwtRefreshSecret: string;

  @IsString()
  @Value('REFRESH_TOKEN_EXPIRES_IN', { default: '7d' }) //for units https://www.npmjs.com/package/ms
  jwtRefreshExpiresIn: StringValue;

  @IsBoolean()
  @Value('SECURE_COOKIE', {
    default: true,
    parse: stringToBoolean,
  })
  isSecureCookie: boolean;

  @IsNumber()
  @Value('JWT_ROUNDS_OF_SALTING', { default: 10, parse: Number.parseInt })
  bcryptSaltOrRound: number;

  @IsString()
  @IsNotEmpty()
  @Value('JWT_PASSWORD_RESET_EXPIRES_IN', { default: '30mins' }) //for units https://www.npmjs.com/package/ms
  passwordResetExpiresIn: StringValue;

  @IsBoolean()
  @Value('CORS_ENABLED', { default: true, parse: stringToBoolean })
  corsEnabled: boolean;

  @IsString()
  @IsNotEmpty()
  @Value('CORS_ORIGIN', {
    default: 'http://localhost:5173,http://localhost:3000',
  })
  corsOrigin: string;

  @IsBoolean()
  @Value('CORS_ALLOW_SECURITY_CREDENTIALS', {
    default: true,
    parse: stringToBoolean,
  })
  allowSecurityCredentials: boolean;

  @IsBoolean()
  @Value('ALLOW_SECURE_COOKIES', { default: true, parse: stringToBoolean })
  allowSecureCookies: boolean;
}
