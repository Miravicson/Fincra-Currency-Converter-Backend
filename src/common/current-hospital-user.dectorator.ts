import { UserWithProfile } from '@/users/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface CustomRequest extends Request {
  user: UserWithProfile;
}

export const CurrentHospitalUser = createParamDecorator(
  (_data, ctx: ExecutionContext): UserWithProfile => {
    const req = ctx.switchToHttp().getRequest<CustomRequest>();
    return req.user;
  },
);
