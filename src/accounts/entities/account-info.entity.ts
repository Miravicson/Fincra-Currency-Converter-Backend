import { AccountInfo } from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@/users/entities/user.entity';

export class AccountInfoEntity implements AccountInfo {
  id: number;
  accountName: string;
  userId: number;
  accountId: string;

  constructor(data: Partial<AccountInfoEntity> | null) {
    if (data !== null) {
      const { user, ...accountEntity } = data;
      Object.assign(this, accountEntity);

      if (user) {
        this.user = new UserEntity(user);
      }
    }
  }

  @ApiProperty({
    required: false,
    type: UserEntity,
    nullable: true,
  })
  @Type(() => UserEntity)
  user?: UserEntity | null;

  @Exclude()
  @ApiHideProperty()
  createdAt: AccountInfo['createdAt'];

  @Exclude()
  @ApiHideProperty()
  updatedAt: AccountInfo['updatedAt'];
}
