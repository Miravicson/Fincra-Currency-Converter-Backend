import { IsNumberString } from 'class-validator';

export class FundOrWithdrawFromAccountDto {
  @IsNumberString()
  amount: string;
}
