import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { MailConsumer } from './mail.consumer';
import { MailService } from './mail.service';
import { TestEmailSendCommand } from './mail.command';
import { MailerService } from './mailer.service';
import { MailerModuleConfig } from '@/config/mailer-module.config';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'MAIL_QUEUE',
    }),
  ],
  providers: [
    MailService,
    MailConsumer,
    TestEmailSendCommand,
    MailerService,
    MailerModuleConfig.configProvider,
  ],
  exports: [MailService],
})
export class MailModule {}
