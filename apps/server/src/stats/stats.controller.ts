import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
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

  @Get('vehicles/:id')
  getVehicle(
    @Param('id', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.statsService.getVehicleStats(vehicleId, userId);
  }
}
