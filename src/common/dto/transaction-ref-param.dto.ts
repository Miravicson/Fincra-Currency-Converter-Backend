import { IsNotEmpty, Validate } from 'class-validator';
import { TransactionExists } from '@common/validations/transaction-exists.validations';

export class TransactionRefParamDto {

  @IsNotEmpty()
  @Validate(TransactionExists)
  readonly reference: string;
}