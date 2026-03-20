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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Get('import/template')
  downloadTemplate(@Res() res: Response) {
    const BOM = '\uFEFF';
    const header =
      'Дата;Категория;Сумма;Описание;Пробег;Литры;Цена за литр\n';
    const example = '15.03.2026;Топливо;3200;АИ-95 Лукойл;56340;42.5;75.3\n';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=autonotes-template.csv',
    );
    res.send(BOM + header + example);
  }

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/octet-stream',
        ];
        const extOk = /\.(csv|xlsx?|xls)$/i.test(file.originalname);
        if (allowed.includes(file.mimetype) || extOk) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Поддерживаются только CSV, XLS и XLSX файлы',
            ),
            false,
          );
        }
      },
    }),
  )
  async importFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('vehicleId', ParseUUIDPipe) vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) throw new BadRequestException('Файл не загружен');
    return this.expenseService.importFromFile(
      file.buffer,
      file.originalname,
      vehicleId,
      userId,
    );
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
