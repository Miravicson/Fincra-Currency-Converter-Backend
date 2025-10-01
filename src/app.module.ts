import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { UsersModule } from './users/users.module';
import { ConfigifyModule } from '@itgorillaz/configify';
import { TransactionsModule } from './transactions/transactions.module';
import { AccountsModule } from './accounts/accounts.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from '@common/response.interceptor';
import { LoggerModule } from '@common/logger.module';

@Module({
  imports: [
    ConfigifyModule.forRootAsync({
      configFilePath: ['./env', `${process.env.NODE_ENV}.env`],
      expandConfig: true,
    }),
    LoggerModule,
    CommonModule,
    UsersModule,
    TransactionsModule,
    AccountsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
