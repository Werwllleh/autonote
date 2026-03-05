import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get('export/csv')
  async exportCsv(
    @CurrentUser('id') userId: string,
    @Query('vehicleId') vehicleId: string | undefined,
    @Res() res: Response,
  ) {
    const expenses = await this.expenseService.findAll(userId, vehicleId);
    const BOM = '\uFEFF';
    const header = 'Дата;Категория;Сумма;Описание;Пробег;Автомобиль\n';
    const rows = expenses.map((e) => {
      const date = new Date(e.date).toLocaleDateString('ru-RU');
      const vehicle = `${e.vehicle.brand} ${e.vehicle.model}`;
      const desc = (e.description || '').replace(/;/g, ',');
      return `${date};${e.category.name};${e.amount};${desc};${e.mileage || ''};${vehicle}`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(BOM + header + rows.join('\n'));
  }

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
