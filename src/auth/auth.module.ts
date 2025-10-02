import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { CaslModule } from '@/casl/casl.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { AccountsModule } from '@/accounts/accounts.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, JwtRefreshStrategy],
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
    UsersModule,
    CaslModule,
    AccountsModule,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
