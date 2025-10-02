import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AccountsQueue {
  constructor(@InjectQueue('accounts') private readonly queue: Queue) {}

  async enqueueAccountCreation(userId: number) {
    await this.queue.add(
      'create-accounts',
      { userId },
      {
        attempts: 5,            // retry up to 5 times
        backoff: {
          type: 'exponential',  // exponential backoff (1s, 2s, 4s…)
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,    // keep failed jobs for debugging
      },
    );
  }
}