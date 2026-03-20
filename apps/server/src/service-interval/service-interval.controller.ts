import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ServiceIntervalService } from './service-interval.service';
import { CreateServiceIntervalDto } from './dto/create-service-interval.dto';
import { UpdateServiceIntervalDto } from './dto/update-service-interval.dto';

@UseGuards(JwtAuthGuard)
@Controller('service-intervals')
export class ServiceIntervalController {
  constructor(private readonly service: ServiceIntervalService) {}

  @Get()
  findAll(
    @Query('vehicleId', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.findAll(vehicleId, userId);
  }

  @Post()
  create(
    @Body() dto: CreateServiceIntervalDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceIntervalDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.remove(id, userId);
  }
}
