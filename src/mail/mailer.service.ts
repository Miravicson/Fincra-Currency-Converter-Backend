import { Inject, Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';
import React from 'react';
import { AppConfig } from '@/config/app.config';
import { MailerModuleConfig } from '@/config/mailer-module.config';

export interface SendMailConfiguration extends nodemailer.SendMailOptions {
  template?: React.JSX.Element;
}

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(MailerModuleConfig)
    private readonly mailerModuleConfig: MailerModuleConfig,
    private readonly appConfig: AppConfig,
  ) {
    if (this.appConfig.environment === 'development') {
      this.transporter = nodemailer.createTransport(
        {
          port: this.mailerModuleConfig.transport.port,
          host: this.mailerModuleConfig.transport.host,
        },
        this.mailerModuleConfig.defaults,
      );
    } else {
      this.transporter = nodemailer.createTransport(
        this.mailerModuleConfig.transport,
        this.mailerModuleConfig.defaults,
      );
    }
  }

  private generateEmail = (template: any) => {
    return render(template);
  };

  async sendMail({ template, ...mailOptions }: SendMailConfiguration) {
    if (template) {
      mailOptions.html = this.generateEmail(template);
    }
    return this.transporter.sendMail(mailOptions);
  }
}
