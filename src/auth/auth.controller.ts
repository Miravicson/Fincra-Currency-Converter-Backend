import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentHospitalUser } from '@common/current-hospital-user.dectorator';
import { UserWithProfile } from '@/users/types';
import { UserEntity } from '@/users/entities/user.entity';
import { SignupDto } from './dto/signup';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { SimpleMessageEntity } from '@common/entities/simple-message.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseErrorEntity } from '@common/entities/response-error.entity';
import { ValidationErrorEntity } from '@common/entities/validation-error-response.entity';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '@common/current-user.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ImpersonateUserDto } from './dto/impersonate-user.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { StopImpersonationDto } from './dto/stop-impersonation.dto';
import { CaslAbilityGuard } from '@/casl/casl-ability.guard';
import { CheckAbility } from '@/casl/casl.decorator';
import { CustomApiResponse } from '@common/custom-api-response.decorator';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @CustomApiResponse({ type: UserEntity, status: HttpStatus.CREATED })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  async signup(
    @Res({ passthrough: true }) response: Response,
    @Body()
    signupDto: SignupDto,
  ) {
    const result = await this.authService.signup(signupDto, response);
    return new UserEntity(result);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @CustomApiResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiCookieAuth()
  async login(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
    @Body() _loginDto: LoginDto,
  ) {
    await this.authService.login(user, response);
    return user;
  }

  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @CheckAbility({
    action: 'impersonate',
    subject: 'User',
  })
  @CustomApiResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiForbiddenResponse({ type: ResponseErrorEntity })
  @ApiBearerAuth()
  @Post('impersonate')
  async impersonateUser(
    @Body() dto: ImpersonateUserDto,
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.impersonateUser(
      {
        userToImpersonateId: dto.impersonateUserId,
        user,
      },
      response,
    );

    return new UserEntity(result);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('stop-impersonation')
  @CustomApiResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  async stopImpersonation(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
    @Body() _dto: StopImpersonationDto,
  ) {
    const result = await this.authService.stopImpersonation(
      user.impersonatedBy,
      response,
    );
    return new UserEntity(result);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @ApiBearerAuth()
  @Post('refresh-token')
  @CustomApiResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  async refreshToken(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(user, response);
    return new UserEntity(result.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CustomApiResponse({ type: UserEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @Get('profile')
  async getProfile(@CurrentUser() user: UserEntity) {
    return user;
  }

  @Get('abilities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CustomApiResponse()
  async getUserAbilities(@CurrentUser() user: UserEntity) {
    const result = await this.authService.getUserAbilities(user);
    return result ? result.rules : [];
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @CustomApiResponse({ status: HttpStatus.NO_CONTENT })
  async logout(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(user.id, response);
  }

  @Put('confirm-account')
  @CustomApiResponse()
  @HttpCode(HttpStatus.OK)
  async confirmAccount(@Body() confirmEmailDto: ConfirmEmailDto) {
    return new SimpleMessageEntity(
      await this.authService.confirmUserAccount(confirmEmailDto),
    );
  }

  @Put('forgot-password')
  @CustomApiResponse()
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return new SimpleMessageEntity(
      await this.authService.beginPasswordReset(forgotPasswordDto),
    );
  }

  @Put('reset-password')
  @CustomApiResponse()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return new SimpleMessageEntity(
      await this.authService.completePasswordReset(resetPasswordDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @Get('resend-confirm-email')
  @CustomApiResponse()
  async resendConfirmEmail(@CurrentHospitalUser() user: UserWithProfile) {
    return new SimpleMessageEntity(
      await this.authService.resendConfirmEmail(user, user.profile!),
    );
  }

  @Get('verify-password-reset/:token')
  @CustomApiResponse()
  async verifyPasswordResetToken(@Param('token') token: string) {
    return new SimpleMessageEntity(
      await this.authService.verifyPasswordResetToken(token),
    );
  }
}
