import { AuthModule } from '@/auth/auth.module';
import { MailModule } from '@/mail/mail.module';
import { PrismaModule } from '@my-prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisConfig } from '@/config/redis.config';
import { UserEmailNotExists } from '@common/user-email-not-exists.validation';
import { LoggerModule } from 'nestjs-pino';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async (redisConfig: RedisConfig) => {
        return {
          defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: false,
          },
          redis: redisConfig,
        };
      },
      inject: [RedisConfig],
    }),
    PrismaModule,
    AuthModule,
    MailModule,
    ScheduleModule.forRoot(),
    LoggerModule,
  ],
  providers: [UserEmailNotExists],
  exports: [
    PrismaModule,
    AuthModule,
    MailModule,
    UserEmailNotExists,
    LoggerModule,
  ],
})
export class CommonModule {}
