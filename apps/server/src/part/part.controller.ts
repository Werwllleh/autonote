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
import { PartService } from './part.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@UseGuards(JwtAuthGuard)
@Controller('parts')
export class PartController {
  constructor(private readonly partService: PartService) {}

  @Get()
  findAll(
    @Query('vehicleId', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.partService.findAll(vehicleId, userId);
  }

  @Post()
  create(
    @Body() dto: CreatePartDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.partService.create(dto, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.partService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.partService.remove(id, userId);
  }
}
