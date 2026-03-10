import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartService {
  constructor(private prisma: PrismaService) {}

  async findAll(vehicleId: string, userId: string) {
    // Verify vehicle belongs to user
    await this.verifyVehicle(vehicleId, userId);
    return this.prisma.part.findMany({
      where: { vehicleId },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreatePartDto, userId: string) {
    await this.verifyVehicle(dto.vehicleId, userId);
    return this.prisma.part.create({
      data: {
        name: dto.name,
        article: dto.article,
        quantity: dto.quantity,
        price: dto.price,
        vehicleId: dto.vehicleId,
      },
    });
  }

  async update(id: string, dto: UpdatePartDto, userId: string) {
    const part = await this.findOneOwned(id, userId);
    return this.prisma.part.update({
      where: { id: part.id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const part = await this.findOneOwned(id, userId);
    return this.prisma.part.delete({ where: { id: part.id } });
  }

  async deductStock(items: { partId: string; quantity: number }[], userId: string) {
    for (const item of items) {
      const part = await this.findOneOwned(item.partId, userId);
      if (part.quantity < item.quantity) {
        throw new BadRequestException(
          `Недостаточно "${part.name}" на складе: есть ${part.quantity}, нужно ${item.quantity}`,
        );
      }
    }
    // All checks passed, deduct
    for (const item of items) {
      await this.prisma.part.update({
        where: { id: item.partId },
        data: { quantity: { decrement: item.quantity } },
      });
    }
  }

  private async verifyVehicle(vehicleId: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  private async findOneOwned(id: string, userId: string) {
    const part = await this.prisma.part.findFirst({
      where: { id, vehicle: { userId } },
    });
    if (!part) throw new NotFoundException('Part not found');
    return part;
  }
}
