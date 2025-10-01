import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthCookieKey, AuthStrategyName } from '../constant';
import { AuthService } from '../auth.service';
import { AccessTokenPayload } from '../types';
import { fromCookieAsJwt } from '../jwt.cookie.extractor';
import { SecurityConfig } from '@/config/security.config';
import { UserEntity } from '@/users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyName.JWT,
) {
  constructor(
    private authService: AuthService,
    securityConfig: SecurityConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookieAsJwt(AuthCookieKey.JWT_TOKEN),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: securityConfig.jwtSecret,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<UserEntity> {
    const userId = payload.impersonatedSub || payload.sub;
    const user = await this.authService.jwtValidateUser(userId);

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
