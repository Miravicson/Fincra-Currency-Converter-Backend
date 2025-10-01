import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty, IsString } from 'class-validator';

@Configuration()
export class AppClientConfig {
  @IsString()
  @IsNotEmpty()
  @Value('CLIENT_EMAIL_CONFIRM_URL')
  emailConfirmUrl: string;

  @IsString()
  @IsNotEmpty()
  @Value('CLIENT_BASE_URL')
  baseUrl: string;

  @IsString()
  @IsNotEmpty()
  @Value('CLIENT_RESET_PASSWORD_URL')
  resetPasswordUrl: string;

  @IsString()
  @IsNotEmpty()
  @Value('CLIENT_LOGIN_URL')
  loginUrl: string;
}
