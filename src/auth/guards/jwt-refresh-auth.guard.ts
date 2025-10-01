import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthStrategyName } from '../constant';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard(
  AuthStrategyName.JWT_REFRESH,
) {}
