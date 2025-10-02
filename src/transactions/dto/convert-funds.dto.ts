import {
  IsNotEmpty,
  IsNumberString,
  IsString,
  Validate,
} from 'class-validator';
import { AccountExists } from '@common/validations/account-exists.validation';

export class ConvertFundsDto {
  @IsNotEmpty()
  @IsString()
  @Validate(AccountExists)
  fromAccountId: string;

  @IsString()
  @IsNotEmpty()
  @Validate(AccountExists)
  toAccountId: string;

  @IsNumberString({})
  amount: string;
}
