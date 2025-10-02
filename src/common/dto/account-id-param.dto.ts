import { IsUUID, Validate } from 'class-validator';
import { AccountExists } from '@common/validations/account-exists.validation';

export class AccountIdParamDto {
  @IsUUID(undefined, { message: 'Invalid account ID format' })
  @Validate(AccountExists)
  id: string;
}
