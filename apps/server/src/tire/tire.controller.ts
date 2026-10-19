import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TireService } from './tire.service';
import { CreateTireSetDto } from './dto/create-tire-set.dto';
import { UpdateTireSetDto } from './dto/update-tire-set.dto';
import { MountTireSetDto } from './dto/mount-tire-set.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class TireController {
  constructor(private readonly tireService: TireService) {}

  @Get('vehicles/:vehicleId/tires')
  findAll(
    @CurrentUser('id') userId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.tireService.findAll(userId, vehicleId);
  }

  @Post('tires')
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTireSetDto,
  ) {
    return this.tireService.create(userId, dto);
  }

  @Get('tires/:id')
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tireService.findOne(userId, id);
  }

  @Put('tires/:id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTireSetDto,
  ) {
    return this.tireService.update(userId, id, dto);
  }

  @Delete('tires/:id')
  delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tireService.delete(userId, id);
  }

  @Post('tires/:id/mount')
  mount(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MountTireSetDto,
  ) {
    return this.tireService.mount(userId, id, dto);
  }
}
