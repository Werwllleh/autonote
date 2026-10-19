import { Test } from '@nestjs/testing';
import * as XLSX from 'xlsx';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';
import { PartService } from '../part/part.service';
import { UploadService } from '../upload/upload.service';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let prisma: {
    vehicle: { findFirst: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    expense: { create: jest.Mock; createMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock; delete: jest.Mock };
    user: { update: jest.Mock };
    category: { findMany: jest.Mock };
    serviceInterval: { update: jest.Mock };
    $transaction: jest.Mock;
  };
  let uploadService: {
    processImage: jest.Mock;
    removeImage: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      vehicle: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      expense: {
        create: jest.fn(),
        createMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: { update: jest.fn() },
      category: { findMany: jest.fn() },
      serviceInterval: { update: jest.fn() },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
    };

    uploadService = {
      processImage: jest.fn(),
      removeImage: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        ExpenseService,
        { provide: PrismaService, useValue: prisma },
        { provide: PartService, useValue: { deductStock: jest.fn() } },
        { provide: UploadService, useValue: uploadService },
      ],
    }).compile();

    service = module.get(ExpenseService);
  });

  describe('create', () => {
    it('resets the owning user expenseReminderCount after creating an expense', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({
        id: 'v1',
        userId: 'u1',
        mileage: 10000,
      });
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

    it('automatically updates vehicle mileage when expense mileage is higher', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({
        id: 'v1',
        userId: 'u1',
        mileage: 50000,
      });
      prisma.expense.create.mockResolvedValue({ id: 'e1' });

      await service.create(
        {
          amount: 2500,
          date: '2026-01-01',
          vehicleId: 'v1',
          categoryId: 'c1',
          mileage: 55000,
        } as any,
        'u1',
      );

      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { mileage: 55000 },
      });
    });

    it('updates service interval lastServiceDate and lastServiceMileage when serviceIntervalId is provided', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({
        id: 'v1',
        userId: 'u1',
        mileage: 50000,
      });
      prisma.expense.create.mockResolvedValue({ id: 'e1' });

      await service.create(
        {
          amount: 5000,
          date: '2026-05-10',
          vehicleId: 'v1',
          categoryId: 'c1',
          mileage: 52000,
          serviceIntervalId: 'si-1',
        } as any,
        'u1',
      );

      expect(prisma.serviceInterval.update).toHaveBeenCalledWith({
        where: { id: 'si-1' },
        data: {
          lastServiceDate: new Date('2026-05-10'),
          lastServiceMileage: 52000,
        },
      });
    });
  });

  describe('remove', () => {
    it('deletes receipt photo from disk if present', async () => {
      prisma.expense.findFirst.mockResolvedValue({
        id: 'e1',
        vehicle: { userId: 'u1' },
        receiptPhoto: '/uploads/receipts/test.webp',
      });
      prisma.expense.delete.mockResolvedValue({ id: 'e1' });

      await service.remove('e1', 'u1');

      expect(uploadService.removeImage).toHaveBeenCalledWith(
        '/uploads/receipts/test.webp',
      );
      expect(prisma.expense.delete).toHaveBeenCalledWith({
        where: { id: 'e1' },
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
