import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { DashboardService } from '@/dashboard/dashboard.service';
import { ResponseErrorEntity } from '@common/entities/response-error.entity';
import { CurrentUser } from '@/auth/current-user.decorator';
import { UserEntity } from '@/users/entities/user.entity';
import { DashboardEntity } from '@/dashboard/entities/dashboard-entity';
import { CustomApiResponse } from '@common/custom-api-response.decorator';

@Controller('dashboard')
@ApiTags('Dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @CustomApiResponse({ type: DashboardEntity })
  @ApiUnauthorizedResponse({ type: ResponseErrorEntity })
  async getDashboardData(@CurrentUser() user: UserEntity) {
    const result = await this.dashboardService.getDashboardData(user.id);

    return new DashboardEntity(result);
  }
}
