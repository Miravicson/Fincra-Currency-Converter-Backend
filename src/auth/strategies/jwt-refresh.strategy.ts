import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthCookieKey, AuthStrategyName } from '../constant';
import { AuthService } from '../auth.service';
import { AccessTokenPayload } from '../types';
import { fromCookieAsJwt } from '../jwt.cookie.extractor';
import { Request } from 'express';
import { SecurityConfig } from '@/config/security.config';
import { UserEntity } from '@/users/entities/user.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyName.JWT_REFRESH,
) {
  constructor(
    private authService: AuthService,
    securityConfig: SecurityConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookieAsJwt(AuthCookieKey.JWT_REFRESH_TOKEN),
      ]),
      secretOrKey: securityConfig.jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: AccessTokenPayload,
  ): Promise<UserEntity> {
    const refreshToken = fromCookieAsJwt(AuthCookieKey.JWT_REFRESH_TOKEN)(
      request,
    );

    const userId = payload.impersonatedSub || payload.sub;
    const user = await this.authService.validateUserByRefreshToken(
      refreshToken,
      userId,
    );

    if (payload.impersonatedSub) {
      return new UserEntity({
        ...user,
        isImpersonated: true,
        impersonatedBy: payload.sub,
      });
    }
    return new UserEntity(user);
  }
}
