import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';
export class SimpleMessageEntity {
  @ApiProperty({ description: 'Message indicating what happened' })
  message: string;

  @ApiProperty({
    description: 'Indicates if action happened successfully or not',
  })
  status: boolean;

  @Exclude()
  @ApiHideProperty()
  user: User;

  constructor(data: Partial<SimpleMessageEntity> | null) {
    if (data !== null) {
      Object.assign(this, data);
    }
  }
}
