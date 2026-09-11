import { Test } from '@nestjs/testing';
import * as XLSX from 'xlsx';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';
import { PartService } from '../part/part.service';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let prisma: {
    vehicle: { findFirst: jest.Mock };
    expense: { create: jest.Mock; createMany: jest.Mock };
    user: { update: jest.Mock };
    category: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      vehicle: { findFirst: jest.fn() },
      expense: { create: jest.fn(), createMany: jest.fn() },
      user: { update: jest.fn() },
      category: { findMany: jest.fn() },
    };

    const module = await Test.createTestingModule({
      providers: [
        ExpenseService,
        { provide: PrismaService, useValue: prisma },
        { provide: PartService, useValue: { deductStock: jest.fn() } },
      ],
    }).compile();

    service = module.get(ExpenseService);
  });

  describe('create', () => {
    it('resets the owning user expenseReminderCount after creating an expense', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', userId: 'u1' });
      prisma.expense.create.mockResolvedValue({ id: 'e1' });

      await service.create(
        {
          amount: 100,
          date: '2026-01-01',
          vehicleId: 'v1',
          categoryId: 'c1',
        } as any,
        'u1',
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { expenseReminderCount: 0 },
      });
    });
  });

  describe('importFromFile', () => {
    function buildXlsxBuffer(): Buffer {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([
        { Дата: '01.01.2026', Категория: 'Топливо', Сумма: '1000' },
      ]);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    }

    it('resets the owning user expenseReminderCount after a successful CSV/XLSX import', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', userId: 'u1' });
      prisma.category.findMany.mockResolvedValue([
        { id: 'c1', name: 'Топливо', slug: 'toplivo', isSystem: true },
      ]);
      prisma.expense.createMany.mockResolvedValue({ count: 1 });

      const buffer = buildXlsxBuffer();

      await service.importFromFile(buffer, 'import.xlsx', 'v1', 'u1');

      expect(prisma.expense.createMany).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { expenseReminderCount: 0 },
      });
    });

    it('does not reset expenseReminderCount when no rows are imported', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', userId: 'u1' });
      prisma.category.findMany.mockResolvedValue([
        { id: 'c1', name: 'Топливо', slug: 'toplivo', isSystem: true },
      ]);
      prisma.expense.createMany.mockResolvedValue({ count: 0 });

      const buffer = buildXlsxBuffer();

      await service.importFromFile(buffer, 'import.xlsx', 'v1', 'u1');

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
