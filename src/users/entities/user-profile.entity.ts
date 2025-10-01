import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { UserProfile, $Enums } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserProfileEntity implements UserProfile {
  constructor(data: Partial<UserProfileEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }

  id: number;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  userId: number;



  @Exclude()
  @ApiHideProperty()
  createdAt: Date;

  @Exclude()
  @ApiHideProperty()
  updatedAt: Date;

  static one(userProfile: UserProfileEntity | null) {
    return new UserProfileEntity(userProfile);
  }

  static many(userProfiles: UserProfileEntity[]) {
    return userProfiles.map(
      (userProfile) => new UserProfileEntity(userProfile),
    );
  }
}
