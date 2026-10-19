import { Test } from '@nestjs/testing';
import { TireService } from './tire.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TireService', () => {
  let service: TireService;
  let prisma: {
    vehicle: { findFirst: jest.Mock; update: jest.Mock };
    tireSet: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    category: { findFirst: jest.Mock };
    expense: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      vehicle: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      tireSet: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
      },
      expense: {
        create: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        TireService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TireService);
  });

  describe('findAll', () => {
    it('throws NotFoundException if vehicle does not exist', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);
      await expect(service.findAll('u1', 'v1')).rejects.toThrow(NotFoundException);
    });

    it('returns tire sets', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', userId: 'u1' });
      prisma.tireSet.findMany.mockResolvedValue([
        { id: 't1', name: 'Michelin', isMounted: true },
      ]);

      const res = await service.findAll('u1', 'v1');
      expect(res).toHaveLength(1);
      expect(res[0].name).toBe('Michelin');
    });
  });

  describe('create', () => {
    it('creates tire set', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', userId: 'u1', mileage: 50000 });
      prisma.tireSet.create.mockResolvedValue({
        id: 't1',
        name: 'Nokian Hakkapeliitta 9',
        season: 'winter_stud',
        vehicleId: 'v1',
      });

      const res = await service.create('u1', {
        name: 'Nokian Hakkapeliitta 9',
        season: 'winter_stud',
        vehicleId: 'v1',
      });

      expect(res.name).toBe('Nokian Hakkapeliitta 9');
      expect(prisma.tireSet.create).toHaveBeenCalled();
    });
  });

  describe('mount', () => {
    it('unmounts previous set, adds driven mileage to its total, and mounts target set', async () => {
      prisma.tireSet.findUnique.mockResolvedValue({
        id: 't-winter',
        name: 'Nokian Winter',
        season: 'winter_stud',
        vehicleId: 'v1',
        vehicle: { id: 'v1', userId: 'u1', mileage: 50000 },
      });

      // Previous mounted set
      prisma.tireSet.findFirst.mockResolvedValue({
        id: 't-summer',
        name: 'Michelin Summer',
        installedMileage: 40000,
        totalMileage: 10000,
      });

      prisma.tireSet.update
        .mockResolvedValueOnce({ id: 't-summer', isMounted: false, totalMileage: 25000 })
        .mockResolvedValueOnce({ id: 't-winter', isMounted: true, installedMileage: 55000 });

      const res = await service.mount('u1', 't-winter', {
        mileage: 55000,
      });

      expect(res.id).toBe('t-winter');
      // Vehicle mileage updated since 55000 > 50000
      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { mileage: 55000 },
      });
      // Previous summer set totalMileage updated with driven 15000 km
      expect(prisma.tireSet.update).toHaveBeenCalledWith({
        where: { id: 't-summer' },
        data: { isMounted: false, totalMileage: 25000 },
      });
    });
  });
});
