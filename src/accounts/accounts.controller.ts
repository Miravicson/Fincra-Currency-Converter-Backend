import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AccountsService } from '@/accounts/accounts.service';
import { CurrentUser } from '@/auth/current-user.decorator';
import { UserEntity } from '@/users/entities/user.entity';
import { AccountEntity } from '@/accounts/entities/account.entity';
import { FundOrWithdrawFromAccountDto } from '@/accounts/dto/fund-or-withdraw-from-account.dto';
import { ValidationErrorEntity } from '@common/entities/validation-error-response.entity';
import { ResponseErrorEntity } from '@common/entities/response-error.entity';
import { CustomApiResponse } from '@common/custom-api-response.decorator';
import { AccountIdParamDto } from '@common/dto/account-id-param.dto';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
@ApiBearerAuth()
@ApiTags('Accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('')
  @CustomApiResponse({ type: AccountEntity, isArray: true })
  @ApiBadRequestResponse({ type: ResponseErrorEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  async getUserAccounts(@CurrentUser() user: UserEntity) {
    const result = await this.accountsService.getUserAccounts(user.id);
    return AccountEntity.many(result);
  }

  @Get(':id')
  @CustomApiResponse({ type: AccountEntity })
  @ApiBadRequestResponse({ type: ResponseErrorEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @ApiNotFoundResponse({ type: ResponseErrorEntity })
  async getUserAccountById(
    @CurrentUser() user: UserEntity,
    @Param(new ValidationPipe({ transform: true }))
    { id: accountId }: AccountIdParamDto,
  ) {
    const result = await this.accountsService.getUserAccountById(
      user.id,
      accountId,
    );
    return new AccountEntity(result);
  }

  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  @Post(':id/fund-account')
  @CustomApiResponse({ type: AccountEntity })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiNotFoundResponse({ type: ResponseErrorEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  async fundAccount(
    @Param(new ValidationPipe({ transform: true }))
    { id: accountId }: AccountIdParamDto,
    @CurrentUser() user: UserEntity,
    @Body() dto: FundOrWithdrawFromAccountDto,
  ) {
    const result = await this.accountsService.fundAccount(
      {
        userId: user.id,
        accountId: accountId,
      },
      dto,
    );

    return new AccountEntity(result);
  }

  @Post(':id/withdraw-from-account')
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiBadRequestResponse({ type: ResponseErrorEntity })
  @ApiNotFoundResponse({ type: ResponseErrorEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  async withdrawFromAccount(
    @Param(new ValidationPipe({ transform: true }))
    { id: accountId }: AccountIdParamDto,
    @CurrentUser() user: UserEntity,
    @Body() dto: FundOrWithdrawFromAccountDto,
  ) {
    const result = await this.accountsService.withdrawFromAccount(
      {
        userId: user.id,
        accountId: accountId,
      },
      dto,
    );

    return new AccountEntity(result);
  }
}
