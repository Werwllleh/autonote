import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTireSetDto } from './dto/create-tire-set.dto';
import { UpdateTireSetDto } from './dto/update-tire-set.dto';
import { MountTireSetDto } from './dto/mount-tire-set.dto';

@Injectable()
export class TireService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, vehicleId: string) {
    await this.verifyVehicle(userId, vehicleId);

    return this.prisma.tireSet.findMany({
      where: { vehicleId },
      orderBy: [{ isMounted: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const set = await this.prisma.tireSet.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!set || set.vehicle.userId !== userId) {
      throw new NotFoundException('Комплект шин не найден');
    }
    return set;
  }

  async create(userId: string, dto: CreateTireSetDto) {
    const vehicle = await this.verifyVehicle(userId, dto.vehicleId);

    // If marked as mounted on creation, unmount any existing mounted set
    if (dto.isMounted) {
      const currentMounted = await this.prisma.tireSet.findFirst({
        where: { vehicleId: dto.vehicleId, isMounted: true },
      });
      if (currentMounted) {
        const currentMil = dto.installedMileage ?? vehicle.mileage;
        let driven = 0;
        if (currentMounted.installedMileage != null && currentMil >= currentMounted.installedMileage) {
          driven = currentMil - currentMounted.installedMileage;
        }
        await this.prisma.tireSet.update({
          where: { id: currentMounted.id },
          data: {
            isMounted: false,
            totalMileage: currentMounted.totalMileage + driven,
          },
        });
      }
    }

    return this.prisma.tireSet.create({
      data: {
        name: dto.name,
        season: dto.season,
        size: dto.size || null,
        productionYear: dto.productionYear || null,
        treadDepth: dto.treadDepth ?? null,
        isMounted: dto.isMounted ?? false,
        storageLocation: dto.storageLocation || null,
        installedMileage: dto.isMounted ? (dto.installedMileage ?? vehicle.mileage) : null,
        installedDate: dto.isMounted ? new Date() : null,
        totalMileage: dto.totalMileage || 0,
        notes: dto.notes || null,
        vehicleId: dto.vehicleId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateTireSetDto) {
    await this.findOne(userId, id);

    return this.prisma.tireSet.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.season !== undefined && { season: dto.season }),
        ...(dto.size !== undefined && { size: dto.size || null }),
        ...(dto.productionYear !== undefined && { productionYear: dto.productionYear || null }),
        ...(dto.treadDepth !== undefined && { treadDepth: dto.treadDepth ?? null }),
        ...(dto.storageLocation !== undefined && { storageLocation: dto.storageLocation || null }),
        ...(dto.totalMileage !== undefined && { totalMileage: dto.totalMileage }),
        ...(dto.notes !== undefined && { notes: dto.notes || null }),
      },
    });
  }

  async delete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.tireSet.delete({ where: { id } });
  }

  async mount(userId: string, id: string, dto: MountTireSetDto) {
    const tireSet = await this.findOne(userId, id);

    // Update vehicle mileage if given mileage is higher than current
    if (dto.mileage > tireSet.vehicle.mileage) {
      await this.prisma.vehicle.update({
        where: { id: tireSet.vehicleId },
        data: { mileage: dto.mileage },
      });
    }

    // Unmount previously mounted set and add driven distance to its totalMileage
    const currentMounted = await this.prisma.tireSet.findFirst({
      where: { vehicleId: tireSet.vehicleId, isMounted: true, id: { not: id } },
    });

    if (currentMounted) {
      let driven = 0;
      if (currentMounted.installedMileage != null && dto.mileage >= currentMounted.installedMileage) {
        driven = dto.mileage - currentMounted.installedMileage;
      }
      await this.prisma.tireSet.update({
        where: { id: currentMounted.id },
        data: {
          isMounted: false,
          totalMileage: currentMounted.totalMileage + driven,
        },
      });
    }

    // Mount current set
    const updatedSet = await this.prisma.tireSet.update({
      where: { id },
      data: {
        isMounted: true,
        installedMileage: dto.mileage,
        installedDate: new Date(dto.date || Date.now()),
        ...(dto.treadDepth != null && { treadDepth: dto.treadDepth }),
        ...(dto.notes && { notes: dto.notes }),
      },
    });

    // Optional expense creation for tire fitting
    if (dto.createExpense && dto.expenseAmount && dto.expenseAmount > 0) {
      const cat = await this.prisma.category.findFirst({
        where: {
          OR: [
            { slug: 'maintenance', userId: null },
            { slug: 'other', userId: null },
          ],
        },
        orderBy: { isSystem: 'desc' },
      });

      if (cat) {
        const seasonName =
          updatedSet.season === 'summer'
            ? 'летней резины'
            : updatedSet.season === 'winter_stud'
            ? 'зимней шипованной резины'
            : updatedSet.season === 'winter_friction'
            ? 'зимней нешипованной резины'
            : 'всесезонной резины';

        await this.prisma.expense.create({
          data: {
            vehicleId: tireSet.vehicleId,
            categoryId: cat.id,
            amount: dto.expenseAmount,
            date: new Date(dto.date || Date.now()),
            mileage: dto.mileage,
            description: `Сезонный шиномонтаж: установка ${seasonName} (${updatedSet.name})`,
          },
        });
      }
    }

    return updatedSet;
  }

  private async verifyVehicle(userId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });
    if (!vehicle) {
      throw new NotFoundException('Автомобиль не найден');
    }
    return vehicle;
  }
}
