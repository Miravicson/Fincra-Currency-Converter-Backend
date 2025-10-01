import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthStrategyName } from '../constant';
import { UserEntity } from '@/users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyName.LOCAL,
) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string): Promise<UserEntity> {
    return new UserEntity(await this.authService.validateUser(email, password));
  }
}
