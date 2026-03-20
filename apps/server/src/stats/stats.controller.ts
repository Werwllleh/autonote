import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StatsService } from './stats.service';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getOverall(@CurrentUser('id') userId: string) {
    return this.statsService.getOverallStats(userId);
  }

  @Get('recent')
  getRecent(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.statsService.getRecentExpenses(
      userId,
      limit ? parseInt(limit, 10) : 5,
    );
  }

  @Get('reminders')
  getReminders(@CurrentUser('id') userId: string) {
    return this.statsService.getReminders(userId);
  }

  @Get('vehicles/:id')
  getVehicle(
    @Param('id', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.statsService.getVehicleStats(vehicleId, userId);
  }
}
