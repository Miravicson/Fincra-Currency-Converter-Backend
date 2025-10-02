import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { Account } from '@prisma/client';
import { AccountInfoEntity } from '@/accounts/entities/account-info.entity';
import { UserEntity } from '@/users/entities/user.entity';

export class AccountEntity implements Account {
  constructor(data: Partial<AccountEntity> | null) {
    if (data !== null) {
      const { info, user, ...accountEntity } = data;
      Object.assign(this, accountEntity);

      if (info) {
        this.info = new AccountInfoEntity(info);
      }

      if (user) {
        this.user = new UserEntity(user);
        this.userId = user.id;
      }
    }
  }
  currencyCode: string;
  id: string;
  currencyName: string;
  currencySymbol: string;
  userId: number;
  availableBalance: number;
  pendingBalance: number;

  @ApiProperty({
    required: false,
    type: AccountInfoEntity,
    nullable: true,
  })
  @Type(() => AccountInfoEntity)
  info?: AccountInfoEntity | null;

  @ApiProperty({
    required: false,
    type: UserEntity,
    nullable: true,
  })
  @Type(() => UserEntity)
  user?: UserEntity | null;

  static many(accounts: AccountEntity[]) {
    return accounts.map((account) => new AccountEntity(account));
  }

  static one(account: AccountEntity | null) {
    return new AccountEntity(account);
  }

  @Exclude()
  @ApiHideProperty()
  createdAt: Account['createdAt'];

  @Exclude()
  @ApiHideProperty()
  updatedAt: Account['updatedAt'];
}
