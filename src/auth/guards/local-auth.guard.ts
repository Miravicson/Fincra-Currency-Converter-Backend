import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthStrategyName } from '../constant';
import { AuthenticatedRequest } from '../types';

@Injectable()
export class LocalAuthGuard extends AuthGuard(AuthStrategyName.LOCAL) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    await super.canActivate(context);
    return !!request.user;
  }
}
