import { Test } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { StatsService } from '../stats/stats.service';
import { ExpenseService } from '../expense/expense.service';
import { PartService } from '../part/part.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    vehicle: { findMany: jest.Mock; findUnique: jest.Mock };
    expense: { groupBy: jest.Mock };
  };
  let statsService: { getVehicleStats: jest.Mock };
  let expenseService: { findAll: jest.Mock };
  let partService: { findAll: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      vehicle: { findMany: jest.fn(), findUnique: jest.fn() },
      expense: { groupBy: jest.fn() },
    };
    statsService = { getVehicleStats: jest.fn() };
    expenseService = { findAll: jest.fn() };
    partService = { findAll: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
        { provide: StatsService, useValue: statsService },
        { provide: ExpenseService, useValue: expenseService },
        { provide: PartService, useValue: partService },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  describe('getUsers', () => {
    it('includes emailVerified, lastLoginAt and computed lastActivityAt for each user', async () => {
      const lastLoginAt = new Date('2026-09-01');
      const activityDate = new Date('2026-08-15');

      prisma.user.findMany.mockResolvedValue([
        {
          id: 'u1',
          email: 'u1@test.com',
          name: null,
          avatar: null,
          role: 'USER',
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          emailVerified: true,
          lastLoginAt,
          _count: { vehicles: 1, categories: 0 },
        },
      ]);
      prisma.user.count.mockResolvedValue(1);
      prisma.expense.groupBy.mockResolvedValue([
        {
          vehicleId: 'v1',
          _count: 2,
          _sum: { amount: 500 },
          _max: { date: activityDate, createdAt: activityDate },
        },
      ]);
      prisma.vehicle.findMany.mockResolvedValue([
        { id: 'v1', userId: 'u1', createdAt: new Date('2026-01-01') },
      ]);

      const result = await service.getUsers();

      expect(result.users[0]).toEqual(
        expect.objectContaining({
          emailVerified: true,
          lastLoginAt,
          lastActivityAt: activityDate,
        }),
      );
    });

    it('returns null lastActivityAt for a user with no vehicles', async () => {
      prisma.user.findMany.mockResolvedValue([
        {
          id: 'u1',
          email: 'u1@test.com',
          name: null,
          avatar: null,
          role: 'USER',
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          emailVerified: false,
          lastLoginAt: null,
          _count: { vehicles: 0, categories: 0 },
        },
      ]);
      prisma.user.count.mockResolvedValue(1);
      prisma.expense.groupBy.mockResolvedValue([]);
      prisma.vehicle.findMany.mockResolvedValue([]);

      const result = await service.getUsers();

      expect(result.users[0]).toEqual(
        expect.objectContaining({ lastActivityAt: null }),
      );
    });

    it('filters to unverified users only when requested', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);
      prisma.expense.groupBy.mockResolvedValue([]);
      prisma.vehicle.findMany.mockResolvedValue([]);

      await service.getUsers(1, 20, undefined, true);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ emailVerified: false }),
        }),
      );
    });

    it('does not filter by emailVerified when unverifiedOnly is not requested', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);
      prisma.expense.groupBy.mockResolvedValue([]);
      prisma.vehicle.findMany.mockResolvedValue([]);

      await service.getUsers();

      const where = prisma.user.findMany.mock.calls[0][0].where;
      expect(where.emailVerified).toBeUndefined();
    });
  });

  describe('getUser', () => {
    it('includes emailVerified, lastLoginAt and lastActivityAt', async () => {
      const lastLoginAt = new Date('2026-09-01');
      const activityDate = new Date('2026-08-15');

      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'u1@test.com',
        name: null,
        avatar: null,
        role: 'USER',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        emailVerified: true,
        lastLoginAt,
        vehicles: [],
      });
      prisma.vehicle.findMany.mockResolvedValue([
        { id: 'v1', userId: 'u1', createdAt: new Date('2026-01-01') },
      ]);
      prisma.expense.groupBy.mockResolvedValue([
        { vehicleId: 'v1', _max: { date: activityDate, createdAt: activityDate } },
      ]);

      const result = await service.getUser('u1');

      expect(result).toEqual(
        expect.objectContaining({
          emailVerified: true,
          lastLoginAt,
          lastActivityAt: activityDate,
        }),
      );
    });

    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUser('missing')).rejects.toThrow('User not found');
    });
  });

  describe('getVehicleCard', () => {
    it('resolves the owner from the vehicle and orchestrates stats/expenses/parts using that owner id', async () => {
      prisma.vehicle.findUnique.mockResolvedValue({
        id: 'v1',
        brand: 'Toyota',
        model: 'Camry',
        userId: 'u1',
        user: { id: 'u1', email: 'owner@test.com', name: 'Owner' },
      });
      statsService.getVehicleStats.mockResolvedValue({ total: 1000 });
      expenseService.findAll.mockResolvedValue([{ id: 'e1' }]);
      partService.findAll.mockResolvedValue([{ id: 'p1' }]);

      const result = await service.getVehicleCard('v1');

      expect(statsService.getVehicleStats).toHaveBeenCalledWith('v1', 'u1');
      expect(expenseService.findAll).toHaveBeenCalledWith('u1', 'v1');
      expect(partService.findAll).toHaveBeenCalledWith('v1', 'u1');
      expect(result).toEqual({
        vehicle: expect.objectContaining({ id: 'v1', brand: 'Toyota', model: 'Camry' }),
        owner: { id: 'u1', email: 'owner@test.com', name: 'Owner' },
        stats: { total: 1000 },
        expenses: [{ id: 'e1' }],
        parts: [{ id: 'p1' }],
      });
    });

    it('throws NotFoundException when the vehicle does not exist', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(service.getVehicleCard('missing')).rejects.toThrow('Vehicle not found');
    });
  });
});
