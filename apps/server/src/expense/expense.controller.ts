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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('vehicleId') vehicleId?: string,
  ) {
    return this.expenseService.findAll(userId, vehicleId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.expenseService.findOne(id, userId);
  }

  @Post()
  create(
    @Body() dto: CreateExpenseDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.expenseService.create(dto, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.expenseService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.expenseService.remove(id, userId);
  }
}
