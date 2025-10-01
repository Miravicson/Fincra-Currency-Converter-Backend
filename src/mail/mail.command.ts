import { Command, CommandRunner } from 'nest-commander';
import { MailService } from './mail.service';

@Command({
  name: 'test-email-sending',
  description: 'test email sending',
})
export class TestEmailSendCommand extends CommandRunner {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async run(
    _passedParams: string[],
    _options?: Record<string, any>,
  ): Promise<void> {
    await this.mailService.sendTestEmail();
  }
}
