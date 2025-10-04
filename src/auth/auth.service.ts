import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { AccessTokenPayload, AuthenticatedUser, SignInResponse } from './types';
import { UsersService } from '@/users/users.service';
import { Prisma, User, UserProfile } from '@prisma/client';
import { SignupDto } from './dto/signup.dto';
import {
  dateFromUnitTime,
  genTokenAndHash,
  hashPassWord,
  hashToken,
} from '@/utils';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from '@/mail/mail.service';
import { UserEntity } from '@/users/entities/user.entity';
import { SecurityConfig } from '@/config/security.config';
import ms, { StringValue } from '@utils/ms';
import { CookieOptions, Response } from 'express';
import { AuthCookieKey } from './constant';
import { AppConfig } from '@/config/app.config';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { CaslAbilityFactory } from '@/casl/casl-ability.factory';
import { UserWithProfile } from '@/users/types';
import { verify } from 'argon2';
import { AccountsQueue } from '@/accounts/accounts.queue';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private readonly securityConfig: SecurityConfig,
    private readonly mailService: MailService,
    private readonly appConfig: AppConfig,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly accountsQueue: AccountsQueue,
  ) {}

  async verifyPasswordResetToken(token: string) {
    const hashedToken = hashToken(token);

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'The reset link is either invalid or has expired. You can go back to forgot-password page to restart the process.',
      );
    }

    return { user, success: true, message: 'Password reset token is valid.' };
  }

  async resendConfirmEmail(user: User, userProfile: UserProfile) {
    if (user.isConfirmedUser) {
      return {
        message: 'You have already confirmed your email address.',
        success: false,
      };
    }

    await this.sendConfirmEmailMessage(
      UserEntity.one({ ...user, profile: userProfile }),
    );
    return {
      message: 'Email confirmation has been resent to your email address.',
      success: true,
    };
  }

  async confirmUserAccount(confirmEmailDto: ConfirmEmailDto) {
    const unconfirmedUser = await this.prisma.user.findFirst({
      where: {
        emailConfirmToken: hashToken(confirmEmailDto.token),
        email: confirmEmailDto.email,
      },
    });

    if (!unconfirmedUser) {
      throw new NotFoundException('Invalid confirmation token');
    }
    const confirmedUser = await this.markUserAsConfirmed(unconfirmedUser);
    await this.mailService.sendWelcomeEmail({
      user: confirmedUser,
      userProfile: confirmedUser.profile!,
    });
    return {
      message: 'Email has been confirmed',
      success: true,
    };
  }

  async beginPasswordReset(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('Check that your email address is correct.');
    }

    await this.sendForgotPasswordEmail(UserEntity.one(user));
    return {
      message: 'Please check your email for a link to reset your password.',
      success: true,
    };
  }

  async completePasswordReset(resetPasswordDto: ResetPasswordDto) {
    let { user } = await this.verifyPasswordResetToken(resetPasswordDto.token);
    user = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassWord(resetPasswordDto.password),
      },
      include: {
        profile: true,
      },
    });
    await this.sendPasswordResetCompletedEmail(UserEntity.one(user));
    await this.markUserPasswordAsReset(user);

    return {
      message: 'Your password has been reset',
      success: true,
    };
  }

  async validateUser(email: string, password: string) {
    const user: User | null = await this.usersService.findOneByEmail(email);
    const validated = user && (await verify(user.password, password));
    if (!validated) {
      throw new UnauthorizedException(`Username or password is incorrect`);
    }
    return await this.getProfile(user.id);
  }

  async jwtValidateUser(userId: number): Promise<AuthenticatedUser> {
    const user = await this.getProfile(userId);

    if (!user) {
      throw new UnauthorizedException(`Username or password is incorrect`);
    }
    return user;
  }

  async validateUserByRefreshToken(
    refreshToken: string | null,
    userId: number,
  ) {
    const user = await this.getProfile(userId);
    const validated =
      !!user &&
      user.refreshToken != null &&
      refreshToken &&
      (await bcrypt.compare(refreshToken, user.refreshToken));
    if (!validated) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return user;
  }

  async login(
    user: AuthenticatedUser,
    response: Response,
  ): Promise<SignInResponse> {
    return await this.signIn({ user, response });
  }

  async signIn({
    user,
    userToImpersonate,
    response,
  }: {
    user: AuthenticatedUser;
    userToImpersonate?: AuthenticatedUser;
    response: Response;
  }): Promise<SignInResponse> {
    const result = {} as SignInResponse;
    const jwtPayload: AccessTokenPayload = {
      sub: user.id,
      iat: Date.now(),
    };

    if (userToImpersonate) {
      jwtPayload.impersonatedSub = userToImpersonate.id;
    }

    result.accessToken = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: this.securityConfig.jwtExpiresIn,
      secret: this.securityConfig.jwtSecret,
    });
    result.refreshToken = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: this.securityConfig.jwtRefreshExpiresIn,
      secret: this.securityConfig.jwtRefreshSecret,
    });

    await this.usersService.update2(
      { id: user.id },
      { refreshToken: await hashPassWord(result.refreshToken) },
    );

    this.setJwtCookie({
      response,
      cookieKey: AuthCookieKey.JWT_TOKEN,
      token: result.accessToken,
      expiresIn: this.securityConfig.jwtExpiresIn,
    });
    this.setJwtCookie({
      response,
      cookieKey: AuthCookieKey.JWT_REFRESH_TOKEN,
      token: result.refreshToken,
      expiresIn: this.securityConfig.jwtRefreshExpiresIn,
    });

    result.user = user as User;
    return result;
  }

  async impersonateUser(
    options: {
      userToImpersonateId: number;
      user: UserEntity;
    },
    response: Response,
  ) {
    const { userToImpersonateId, user } = options;
    const userToImpersonate = await this.getProfile(userToImpersonateId);
    if (!userToImpersonate) {
      throw new ForbiddenException(
        `Could not find user with id ${userToImpersonateId}`,
      );
    }
    await this.signIn({
      user,
      userToImpersonate,
      response,
    });

    return {
      ...userToImpersonate,
      isImpersonated: true,
      impersonatedBy: user.id,
    };
  }

  async stopImpersonation(
    impersonatedById: number | undefined,
    response: Response,
  ) {
    let impersonatingUser: User | null;

    if (
      !impersonatedById ||
      !(impersonatingUser = await this.usersService.findOne(impersonatedById))
    ) {
      throw new UnauthorizedException(
        'You are not allowed to stop impersonation',
      );
    }

    await this.signIn({
      user: impersonatingUser,
      response,
    });

    return await this.getProfile(impersonatingUser.id);
  }

  async signup(signupDto: SignupDto, response: Response) {
    const createUserDto: CreateUserDto = {
      email: signupDto.email,
      password: signupDto.password,
    };
    const user = await this.usersService.create(createUserDto);
    const userProfile = await this.prisma.userProfile.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        firstName: signupDto.firstName,
        lastName: signupDto.lastName,
      },
    });
    await this.sendConfirmEmailMessage(
      UserEntity.one({ ...user, profile: userProfile }),
    );
    await this.signIn({ user, response });

    await this.accountsQueue.enqueueAccountCreation(user.id);

    return await this.getProfile(user.id);
  }

  async getProfile(userId: number): Promise<User | null> {
    const filter: Prisma.UserDefaultArgs = {
      include: {
        profile: {
          select: {
            phoneNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    };

    return this.usersService.findOne(userId, filter);
  }

  async getUserAbilities(user: UserEntity) {
    const abilities = await this.caslAbilityFactory.createForUser(
      user as UserWithProfile,
    );
    return abilities;
  }

  async logout(userId: number, response: Response) {
    await this.usersService.update2({ id: userId }, { refreshToken: null });
    this.setJwtCookie({
      response,
      cookieKey: AuthCookieKey.JWT_TOKEN,
      token: '',
      expiresIn: this.securityConfig.jwtExpiresIn,
      maxAge: 0,
    });
    this.setJwtCookie({
      response,
      cookieKey: AuthCookieKey.JWT_REFRESH_TOKEN,
      token: '',
      expiresIn: this.securityConfig.jwtRefreshExpiresIn,
      maxAge: 0,
    });
  }

  private setJwtCookie({
    response,
    token,
    cookieKey,
    maxAge,
    expiresIn,
  }: {
    response: Response;
    token: string;
    cookieKey: string;
    expiresIn: StringValue;
    maxAge?: number;
  }): void {
    const normalizedMaxAge = maxAge != null ? maxAge : ms(expiresIn);
    const secure = this.appConfig.environment === 'production';
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure,
      maxAge: normalizedMaxAge,
      path: '/',
      sameSite: 'none',
    };
    response.cookie(cookieKey, token, cookieOptions);
  }

  private async markUserAsConfirmed(user: User) {
    return await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmToken: null,
        emailConfirmedAt: new Date(),
        isConfirmedUser: true,
      },
      include: {
        profile: true,
      },
    });
  }

  private async markUserPasswordAsReset(user: User) {
    return await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(),
      },
    });
  }

  private async createAndSaveEmailConfirmToken(user: User): Promise<string> {
    const { token, hashedToken } = genTokenAndHash();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmToken: hashedToken,
      },
    });

    return token;
  }

  private async createAndSaveForgotPasswordToken(user: User): Promise<string> {
    const { token, hashedToken } = genTokenAndHash();
    const { passwordResetExpiresIn } = this.securityConfig;
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: dateFromUnitTime(passwordResetExpiresIn),
      },
    });

    return token;
  }

  private async sendConfirmEmailMessage(user: UserEntity) {
    const confirmEmailToken = await this.createAndSaveEmailConfirmToken(user);

    return this.mailService.sendConfirmationEmail({
      user,
      userProfile: user.profile!,
      token: confirmEmailToken,
    });
  }

  private async sendForgotPasswordEmail(user: UserEntity) {
    const forgotPasswordToken =
      await this.createAndSaveForgotPasswordToken(user);
    return this.mailService.sendPasswordResetToken({
      user,
      token: forgotPasswordToken,
      userProfile: user.profile!,
    });
  }

  private async sendPasswordResetCompletedEmail(user: UserEntity) {
    return this.mailService.sendResetPasswordSuccessEmail({
      user,
      userProfile: user.profile!,
    });
  }
}
