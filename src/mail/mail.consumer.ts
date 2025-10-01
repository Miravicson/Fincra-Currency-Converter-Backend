import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { HasEmail, HasNames, MailJobNames } from './constants';
import { User, UserProfile } from '@prisma/client';
import { MailerService, SendMailConfiguration } from './mailer.service';
import WelcomeEmail from './templates/welcome-email';
import ConfirmEmail from './templates/confirm-email';
import ResetPasswordEmail from './templates/reset-password';
import PasswordResetSuccessful from './templates/password-reset-complete';
import { AppClientConfig } from '@/config/app-client.config';

@Processor('MAIL_QUEUE')
export class MailConsumer {
  private logger = new Logger(this.constructor.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly appClientConfig: AppClientConfig,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}.`);
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.verbose(`Completed job: ${job.id}`);
    this.logger.debug(result);
  }

  @OnQueueFailed()
  onError(job: Job, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process(MailJobNames.TEST_EMAIL)
  async testSending(_job: Job) {
    try {
      const emailData: SendMailConfiguration = {
        template: WelcomeEmail({ firstName: 'Victor' }),
        subject: 'Testing Email',
        to: 'victor@mail.com',
      };

      return await this.mailerService.sendMail(emailData);
    } catch (error: any) {
      this.logger.error(`Failed to send test email `, error.stack);
      throw error;
    }
  }

  @Process(MailJobNames.WELCOME_EMAIL)
  async sendWelcomeEmail(job: Job<{ userProfile: HasNames; user: HasEmail }>) {
    const { user, userProfile } = job.data;

    const template = WelcomeEmail({
      firstName: userProfile.firstName ?? userProfile.lastName ?? '',
    });

    const subject = 'Welcome to Bloomers;';
    const to = user.email;

    const emailData = {
      template,
      subject,
      to,
    };

    this.logger.verbose(`Sending welcome email`);

    try {
      return await this.mailerService.sendMail(emailData);
    } catch (error: any) {
      this.logger.error(`Failed to send welcome email `, error.stack);
      throw error;
    }
  }

  @Process(MailJobNames.CONFIRM_EMAIL)
  async sendConfirmEmail(
    job: Job<{ user: HasEmail; userProfile: HasNames; token: string }>,
  ) {
    const { user, token: confirmEmailToken } = job.data;

    const confirmEmailUrl = new URL(
      this.appClientConfig.emailConfirmUrl,
      this.appClientConfig.baseUrl,
    );
    confirmEmailUrl.searchParams.append('token', confirmEmailToken);
    const template = ConfirmEmail({ url: confirmEmailUrl.href });

    const subject = 'Please confirm your email address';
    const to = user.email;

    const emailData = {
      template,
      subject,
      to,
    };

    this.logger.verbose(`Sending confirmation email`);

    try {
      return await this.mailerService.sendMail(emailData);
    } catch (error: any) {
      this.logger.error(`Failed to send confirmation email `, error.stack);
      throw error;
    }
  }

  @Process(MailJobNames.RESET_PASSWORD)
  async sendResetPasswordEmail(
    job: Job<{ user: HasEmail; token: string; userProfile: HasNames }>,
  ) {
    const { user, token: resetPasswordToken, userProfile } = job.data;

    const resetPasswordUrl = new URL(
      this.appClientConfig.resetPasswordUrl,
      this.appClientConfig.baseUrl,
    );

    resetPasswordUrl.searchParams.append('token', resetPasswordToken);

    const template = ResetPasswordEmail({
      url: resetPasswordUrl.href,
      firstName: userProfile.firstName ?? userProfile.lastName ?? '',
    });
    const subject = 'Reset your password';
    const to = user.email;

    const emailData = {
      template,
      subject,
      to,
    };

    this.logger.verbose(
      `Sending reset password email`,
      'url: ',
      resetPasswordUrl.href,
    );

    try {
      const result = await this.mailerService.sendMail(emailData);
      this.logger.log('Reset password email sent successfully');
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to send reset password email `, error.stack);
      throw error;
    }
  }

  @Process(MailJobNames.RESET_PASSWORD_SUCCESS)
  async sendResetPasswordSuccessEmail(
    job: Job<{ user: HasEmail; userProfile: HasNames }>,
  ) {
    const { user, userProfile } = job.data;
    const loginUrl = new URL(
      this.appClientConfig.loginUrl,
      this.appClientConfig.baseUrl,
    );

    const template = PasswordResetSuccessful({
      firstName: userProfile.firstName ?? '',
      url: loginUrl.href,
    });

    const subject = 'Your password has been reset';
    const to = user.email;

    const emailData = {
      template,
      subject,
      to,
    };

    this.logger.verbose(
      `Sending reset password success email. url: `,
      loginUrl.href,
    );

    try {
      return await this.mailerService.sendMail(emailData);
    } catch (error: any) {
      this.logger.error(
        `Failed to send reset password success email `,
        error.stack,
      );
      throw error;
    }
  }

  @Process(MailJobNames.PASSWORD_CHANGE_SUCCESS)
  async sendPasswordChangedEmail(
    job: Job<{ user: User; userProfile: UserProfile }>,
  ) {
    const { user, userProfile } = job.data;

    const template = WelcomeEmail({ firstName: userProfile.firstName ?? '' });

    const subject = 'You changed your password recently';
    const to = user.email;

    const emailData = {
      template,
      subject,
      to,
    };

    this.logger.verbose(`Sending password change success email`);

    try {
      return await this.mailerService.sendMail(emailData);
    } catch (error: any) {
      this.logger.error(
        `Failed to send reset password success email `,
        error.stack,
      );
      throw error;
    }
  }
}
