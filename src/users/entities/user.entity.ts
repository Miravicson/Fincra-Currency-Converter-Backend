import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { $Enums, User } from '@prisma/client';
import { UserProfileEntity } from './user-profile.entity';
import { AuthenticatedUser } from '@/auth/types';

export class UserEntity implements User {
  constructor(
    data: Partial<UserEntity> | Partial<Omit<UserEntity, 'password'>> | null,
  ) {
    if (data !== null) {
      const { profile, ...userEntity } = data;
      Object.assign(this, userEntity);

      if (profile) {
        this.profile = new UserProfileEntity(profile);
      }
    }
  }

  @ApiProperty({ enum: $Enums.Role, enumName: 'Role' })
  role: $Enums.Role;

  static many(users: UserEntity[]) {
    return users.map((user) => new UserEntity(user));
  }

  static one(user: UserEntity | AuthenticatedUser | null) {
    return new UserEntity(user);
  }
  id: number;
  email: string;
  isImpersonated?: boolean;
  impersonatedBy?: number;

  @ApiProperty({
    required: false,
    type: UserProfileEntity,
    nullable: true,
  })
  @Type(() => UserProfileEntity)
  profile?: UserProfileEntity | null;

  @Exclude()
  @ApiHideProperty()
  createdAt: User['createdAt'];

  @Exclude()
  @ApiHideProperty()
  updatedAt: User['updatedAt'];

  @Exclude()
  @ApiHideProperty()
  password: string;

  @Exclude()
  @ApiHideProperty()
  refreshToken: string | null;

  @Exclude()
  @ApiHideProperty()
  passwordChangedAt: User['passwordChangedAt'];

  @Exclude()
  @ApiHideProperty()
  passwordResetToken: User['passwordResetToken'];

  @Exclude()
  @ApiHideProperty()
  passwordResetExpires: User['passwordResetExpires'];

  @Exclude()
  @ApiHideProperty()
  emailConfirmToken: User['emailConfirmToken'];

  @Exclude()
  @ApiHideProperty()
  emailConfirmedAt: User['emailConfirmedAt'];

  @Exclude()
  @ApiHideProperty()
  otp: User['otp'];

  @Exclude()
  @ApiHideProperty()
  otpExpires: User['otpExpires'];

  @Exclude()
  @ApiHideProperty()
  otpConfirmed: User['otpConfirmed'];

  @Exclude()
  @ApiHideProperty()
  isConfirmedUser: User['isConfirmedUser'];

  @Exclude()
  @ApiHideProperty()
  isDeleted: User['isDeleted'];

  @Exclude()
  @ApiHideProperty()
  isActive: User['isActive'];
}
