import { getLastActivityDates } from './user-activity.util';
import { PrismaService } from '../prisma/prisma.service';

describe('getLastActivityDates', () => {
  let prisma: { vehicle: { findMany: jest.Mock }; expense: { groupBy: jest.Mock } };

  beforeEach(() => {
    prisma = {
      vehicle: { findMany: jest.fn() },
      expense: { groupBy: jest.fn() },
    };
  });

  it('returns null for a user with no vehicles', async () => {
    prisma.vehicle.findMany.mockResolvedValue([]);

    const result = await getLastActivityDates(prisma as unknown as PrismaService, ['u1']);

    expect(result.get('u1')).toBeNull();
    expect(prisma.expense.groupBy).not.toHaveBeenCalled();
  });

  it('uses vehicle.createdAt when the vehicle has no expenses', async () => {
    const createdAt = new Date('2026-01-01');
    prisma.vehicle.findMany.mockResolvedValue([
      { id: 'v1', userId: 'u1', createdAt },
    ]);
    prisma.expense.groupBy.mockResolvedValue([]);

    const result = await getLastActivityDates(prisma as unknown as PrismaService, ['u1']);

    expect(result.get('u1')).toEqual(createdAt);
  });

  it('uses the latest expense date when it is more recent than the vehicle creation date', async () => {
    const createdAt = new Date('2026-01-01');
    const expenseDate = new Date('2026-03-01');
    prisma.vehicle.findMany.mockResolvedValue([
      { id: 'v1', userId: 'u1', createdAt },
    ]);
    prisma.expense.groupBy.mockResolvedValue([
      { vehicleId: 'v1', _max: { date: expenseDate } },
    ]);

    const result = await getLastActivityDates(prisma as unknown as PrismaService, ['u1']);

    expect(result.get('u1')).toEqual(expenseDate);
  });

  it('computes activity independently per user', async () => {
    const oldDate = new Date('2025-01-01');
    const newDate = new Date('2026-06-01');
    prisma.vehicle.findMany.mockResolvedValue([
      { id: 'v1', userId: 'u1', createdAt: oldDate },
      { id: 'v2', userId: 'u2', createdAt: newDate },
    ]);
    prisma.expense.groupBy.mockResolvedValue([]);

    const result = await getLastActivityDates(prisma as unknown as PrismaService, ['u1', 'u2']);

    expect(result.get('u1')).toEqual(oldDate);
    expect(result.get('u2')).toEqual(newDate);
  });
});
