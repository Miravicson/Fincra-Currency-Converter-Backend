import { IsPositive } from 'class-validator';

export class FundOrWithdrawFromAccountDto {
  @IsPositive()
  amount: number;
}
