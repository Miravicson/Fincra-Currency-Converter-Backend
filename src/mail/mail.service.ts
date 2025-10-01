import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';

import { HasEmail, HasNames, MailJobNames } from './constants';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    @InjectQueue('MAIL_QUEUE')
    private mailQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.mailQueue && (await this.mailQueue.isReady())) {
      this.logger.log(`Mail service connected to ${this.mailQueue.name} ✅`);
    }
  }

  async sendTestEmail() {
    try {
      await this.mailQueue.add(MailJobNames.TEST_EMAIL);
      return true;
    } catch (error) {
      this.logger.error(`Error sending welcome email`, error);
      return false;
    }
  }

  async sendWelcomeEmail(options: {
    user: HasEmail;
    userProfile: HasNames;
  }): Promise<boolean> {
    try {
      await this.mailQueue.add(MailJobNames.WELCOME_EMAIL, options);
      return true;
    } catch (error) {
      this.logger.error(`Error sending welcome email`, error);
      return false;
    }
  }

  async sendConfirmationEmail(options: {
    user: HasEmail;
    userProfile: HasNames;
    token: string;
  }): Promise<boolean> {
    try {
      await this.mailQueue.add(MailJobNames.CONFIRM_EMAIL, options);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending confirmation email to [${options.user.email}]`,
        error,
      );
      return false;
    }
  }

  async sendPasswordResetToken(options: {
    user: HasEmail;
    token: string;
    userProfile: HasNames;
  }): Promise<boolean> {
    try {
      this.logger.verbose(
        `Queuing up job to send reset password email for [${options.user.email}]`,
      );
      await this.mailQueue.add(MailJobNames.RESET_PASSWORD, options);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending password reset token to [${options.user.email}] email`,
        error,
      );
      return false;
    }
  }

  async sendResetPasswordSuccessEmail(options: {
    user: HasEmail;
    userProfile: HasNames;
  }): Promise<boolean> {
    try {
      await this.mailQueue.add(MailJobNames.RESET_PASSWORD_SUCCESS, options);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending password reset success email to [${options.user.email}] email`,
        error,
      );
      return false;
    }
  }
  async sendPasswordChangedEmail(options: {
    user: HasEmail;
  }): Promise<boolean> {
    try {
      await this.mailQueue.add(MailJobNames.PASSWORD_CHANGE_SUCCESS, options);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending password change success email to [${options.user.email}] email`,
        error,
      );
      return false;
    }
  }
}
