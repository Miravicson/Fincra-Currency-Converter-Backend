import { AuthModule } from '@/auth/auth.module';
import { MailModule } from '@/mail/mail.module';
import { PrismaModule } from '@my-prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisConfig } from '@/config/redis.config';
import { LoggerModule } from 'nestjs-pino';
import { RedisModule } from '@common/redis';
import { ExchangeRateModule } from '@common/integrations/exchange-rate/exchange-rate.module';
import { CacheModule } from '@nestjs/cache-manager';
import { AppConfig, Environment } from '@/config/app.config';
import { CacheableMemory } from 'cacheable';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { ExchangeRateHostService } from '@common/integrations/exchange-rate-host.service';
import { TransactionExists } from '@common/validations/transaction-exists.validations';
import { UserEmailNotExists } from '@common/validations/user-email-not-exists.validation';
import { AccountExists } from '@common/validations/account-exists.validation';

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
    RedisModule,
    ExchangeRateModule,
    CacheModule.registerAsync({
      useFactory: async (redisConfig: RedisConfig, appConfig: AppConfig) => {
        const redisProtocol =
          appConfig.environment === Environment.Production ? 'rediss' : 'redis';
        const redisUrl = `${redisProtocol}://${redisConfig.username}:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}`;
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis(redisUrl),
          ],
        };
      },
      inject: [RedisConfig, AppConfig],
      isGlobal: true,
    }),
  ],
  providers: [
    UserEmailNotExists,
    AccountExists,
    ExchangeRateHostService,
    TransactionExists,
  ],
  exports: [
    PrismaModule,
    AuthModule,
    MailModule,
    UserEmailNotExists,
    AccountExists,
    TransactionExists,
    LoggerModule,
    ExchangeRateHostService,
    RedisModule,
    ExchangeRateModule,
  ],
})
export class CommonModule {}
