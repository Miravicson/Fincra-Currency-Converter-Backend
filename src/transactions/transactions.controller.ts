import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransactionsService } from '@/transactions/transactions.service';
import { ConvertFundsDto } from '@/transactions/dto/convert-funds.dto';
import { ValidationErrorEntity } from '@common/entities/validation-error-response.entity';
import { ResponseErrorEntity } from '@common/entities/response-error.entity';
import { CurrentUser } from '@/auth/current-user.decorator';
import { UserEntity } from '@/users/entities/user.entity';
import { TransactionEntity } from '@/transactions/entities/transaction.entity';
import { GetManyTransactionsDto } from '@/transactions/dto/get-many-transactions.dto';
import { CustomApiResponse } from '@common/custom-api-response.decorator';

@ApiBearerAuth()
@ApiTags('Transactions')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('convert-funds')
  @CustomApiResponse({ type: TransactionEntity, status: HttpStatus.CREATED })
  @ApiBadRequestResponse({ type: ValidationErrorEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  async convertFunds(
    @Body() dto: ConvertFundsDto,
    @CurrentUser() user: UserEntity,
  ) {
    const result = await this.transactionsService.convertFunds(user.id, dto);

    return new TransactionEntity(result);
  }

  @Get('')
  @CustomApiResponse({ type: TransactionEntity, isArray: true, paginated: true })
  async getManyTransactions(
    @Query() dto: GetManyTransactionsDto,
    @CurrentUser() user: UserEntity,
  ) {
    const result = await this.transactionsService.getManyTransactions(
      user.id,
      dto,
    );

    return TransactionEntity.paginate(result);
  }
}
