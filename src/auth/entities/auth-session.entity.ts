import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserEntity } from '@/users/entities/user.entity';
export class AuthSessionEntity {
  @ApiProperty({ type: UserEntity })
  @Type(() => UserEntity)
  user: UserEntity;

  constructor(data: Partial<AuthSessionEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
