import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { PartService } from '../part/part.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private partService: PartService,
  ) {}

  findAll(userId: string, vehicleId?: string) {
    return this.prisma.expense.findMany({
      where: {
        vehicle: { userId },
        ...(vehicleId && { vehicleId }),
      },
      include: { category: true, vehicle: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, vehicle: { userId } },
      include: { category: true, vehicle: true },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(dto: CreateExpenseDto, userId: string) {
    // Verify vehicle belongs to user
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, userId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Deduct stock parts if provided
    if (dto.stockParts?.length) {
      await this.partService.deductStock(dto.stockParts, userId);
    }

    return this.prisma.expense.create({
      data: {
        amount: dto.amount,
        date: new Date(dto.date),
        description: dto.description,
        mileage: dto.mileage,
        vehicleId: dto.vehicleId,
        categoryId: dto.categoryId,
        liters: dto.liters,
        pricePerLiter: dto.pricePerLiter,
        bonuses: dto.bonuses,
        parts: dto.parts ? (dto.parts as unknown as Prisma.InputJsonValue) : undefined,
        laborCost: dto.laborCost,
        dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
        dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
      },
      include: { category: true, vehicle: true },
    });
  }

  async update(id: string, dto: UpdateExpenseDto, userId: string) {
    await this.findOne(id, userId);

    const data: Prisma.ExpenseUncheckedUpdateInput = {
      date: dto.date ? new Date(dto.date) : undefined,
      amount: dto.amount,
      description: dto.description,
      mileage: dto.mileage,
      vehicleId: dto.vehicleId,
      categoryId: dto.categoryId,
      liters: dto.liters,
      pricePerLiter: dto.pricePerLiter,
      bonuses: dto.bonuses,
      laborCost: dto.laborCost,
    };

    if (dto.parts === null) {
      data.parts = Prisma.DbNull;
    } else if (dto.parts) {
      data.parts = dto.parts as unknown as Prisma.InputJsonValue;
    }

    if (dto.dateFrom === null) {
      data.dateFrom = null;
    } else if (dto.dateFrom) {
      data.dateFrom = new Date(dto.dateFrom);
    }

    if (dto.dateTo === null) {
      data.dateTo = null;
    } else if (dto.dateTo) {
      data.dateTo = new Date(dto.dateTo);
    }

    return this.prisma.expense.update({
      where: { id },
      data,
      include: { category: true, vehicle: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.expense.delete({ where: { id } });
  }

  async importFromFile(
    buffer: Buffer,
    originalName: string,
    vehicleId: string,
    userId: string,
  ) {
    // Verify vehicle belongs to user
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Parse file
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    if (!sheet) throw new BadRequestException('Файл пуст');

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
    });
    if (rows.length === 0)
      throw new BadRequestException('Файл не содержит данных');

    // Load categories for name→id mapping
    const categories = await this.prisma.category.findMany();
    const catMap = new Map<string, string>();
    for (const c of categories) {
      catMap.set(c.name.toLowerCase().trim(), c.id);
      catMap.set(c.slug.toLowerCase().trim(), c.id);
    }

    const errors: string[] = [];
    const toCreate: Prisma.ExpenseCreateManyInput[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed + header row

      // Normalize column names (support both ru and en)
      const get = (keys: string[]) => {
        for (const k of keys) {
          const val = row[k];
          if (val !== undefined && val !== '') return String(val).trim();
        }
        return '';
      };

      const dateStr = get(['Дата', 'дата', 'Date', 'date']);
      const categoryStr = get([
        'Категория',
        'категория',
        'Category',
        'category',
      ]);
      const amountStr = get(['Сумма', 'сумма', 'Amount', 'amount']);
      const description = get([
        'Описание',
        'описание',
        'Description',
        'description',
      ]);
      const mileageStr = get(['Пробег', 'пробег', 'Mileage', 'mileage']);
      const litersStr = get(['Литры', 'литры', 'Liters', 'liters']);
      const pricePerLiterStr = get([
        'Цена за литр',
        'цена за литр',
        'Price per liter',
        'pricePerLiter',
      ]);

      // Validate required fields
      if (!dateStr) {
        errors.push(`Строка ${rowNum}: отсутствует дата`);
        continue;
      }
      if (!categoryStr) {
        errors.push(`Строка ${rowNum}: отсутствует категория`);
        continue;
      }
      if (!amountStr) {
        errors.push(`Строка ${rowNum}: отсутствует сумма`);
        continue;
      }

      // Parse date (supports DD.MM.YYYY, YYYY-MM-DD, DD/MM/YYYY)
      const date = this.parseDate(dateStr);
      if (!date) {
        errors.push(
          `Строка ${rowNum}: неверный формат даты "${dateStr}" (ожидается ДД.ММ.ГГГГ)`,
        );
        continue;
      }

      // Parse amount
      const amount = parseFloat(amountStr.replace(',', '.').replace(/\s/g, ''));
      if (isNaN(amount) || amount < 0) {
        errors.push(`Строка ${rowNum}: неверная сумма "${amountStr}"`);
        continue;
      }

      // Resolve category
      const categoryId = catMap.get(categoryStr.toLowerCase());
      if (!categoryId) {
        errors.push(
          `Строка ${rowNum}: категория "${categoryStr}" не найдена`,
        );
        continue;
      }

      // Optional fields
      const mileage = mileageStr
        ? parseInt(mileageStr.replace(/\s/g, ''), 10)
        : undefined;
      const liters = litersStr
        ? parseFloat(litersStr.replace(',', '.'))
        : undefined;
      const pricePerLiter = pricePerLiterStr
        ? parseFloat(pricePerLiterStr.replace(',', '.'))
        : undefined;

      toCreate.push({
        amount,
        date,
        description: description || undefined,
        mileage:
          mileage !== undefined && !isNaN(mileage) ? mileage : undefined,
        liters: liters !== undefined && !isNaN(liters) ? liters : undefined,
        pricePerLiter:
          pricePerLiter !== undefined && !isNaN(pricePerLiter)
            ? pricePerLiter
            : undefined,
        vehicleId,
        categoryId,
      });
    }

    if (toCreate.length === 0 && errors.length > 0) {
      throw new BadRequestException({
        message: 'Не удалось импортировать ни одной записи',
        errors,
      });
    }

    const result = await this.prisma.expense.createMany({ data: toCreate });

    return {
      imported: result.count,
      total: rows.length,
      errors,
    };
  }

  private parseDate(str: string): Date | null {
    // DD.MM.YYYY or DD/MM/YYYY
    const dmyMatch = str.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    if (dmyMatch) {
      const d = new Date(
        parseInt(dmyMatch[3]),
        parseInt(dmyMatch[2]) - 1,
        parseInt(dmyMatch[1]),
      );
      if (!isNaN(d.getTime())) return d;
    }
    // YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const d = new Date(
        parseInt(isoMatch[1]),
        parseInt(isoMatch[2]) - 1,
        parseInt(isoMatch[3]),
      );
      if (!isNaN(d.getTime())) return d;
    }
    // Try native parsing as fallback (for Excel date serial numbers converted by xlsx)
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    return null;
  }
}
