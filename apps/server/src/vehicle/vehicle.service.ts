import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, userId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  create(dto: CreateVehicleDto, userId: string) {
    return this.prisma.vehicle.create({
      data: { ...dto, userId },
    });
  }

  async update(id: string, dto: UpdateVehicleDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.vehicle.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
