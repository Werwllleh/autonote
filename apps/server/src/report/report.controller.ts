import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /** Create a public report link (authenticated) */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body('vehicleId', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportService.create(vehicleId, userId);
  }

  /** View a public report (no auth required) */
  @Get(':token')
  getReport(@Param('token') token: string) {
    return this.reportService.getReport(token);
  }

  /** Revoke a report link (authenticated) */
  @UseGuards(JwtAuthGuard)
  @Delete(':token')
  revoke(
    @Param('token') token: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportService.revoke(token, userId);
  }
}
