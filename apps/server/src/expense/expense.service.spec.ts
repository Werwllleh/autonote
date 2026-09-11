import { Test } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';
import { PartService } from '../part/part.service';

describe('ExpenseService.create', () => {
  let service: ExpenseService;
  let prisma: {
    vehicle: { findFirst: jest.Mock };
    expense: { create: jest.Mock };
    user: { update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      vehicle: { findFirst: jest.fn() },
      expense: { create: jest.fn() },
      user: { update: jest.fn() },
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

  it('resets the owning user expenseReminderCount after creating an expense', async () => {
    prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', userId: 'u1' });
    prisma.expense.create.mockResolvedValue({ id: 'e1' });

    await service.create(
      { amount: 100, date: '2026-01-01', vehicleId: 'v1', categoryId: 'c1' } as any,
      'u1',
    );

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { expenseReminderCount: 0 },
    });
  });
});
