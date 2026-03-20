import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceIntervalDto } from './dto/create-service-interval.dto';
import { UpdateServiceIntervalDto } from './dto/update-service-interval.dto';

@Injectable()
export class ServiceIntervalService {
  constructor(private prisma: PrismaService) {}

  async findAll(vehicleId: string, userId: string) {
    await this.verifyVehicle(vehicleId, userId);
    return this.prisma.serviceInterval.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateServiceIntervalDto, userId: string) {
    await this.verifyVehicle(dto.vehicleId, userId);
    return this.prisma.serviceInterval.create({
      data: {
        name: dto.name,
        intervalKm: dto.intervalKm,
        intervalMonths: dto.intervalMonths,
        lastServiceDate: dto.lastServiceDate
          ? new Date(dto.lastServiceDate)
          : undefined,
        lastServiceMileage: dto.lastServiceMileage,
        vehicleId: dto.vehicleId,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateServiceIntervalDto,
    userId: string,
  ) {
    const interval = await this.findOne(id, userId);
    const { lastServiceDate, ...rest } = dto;
    return this.prisma.serviceInterval.update({
      where: { id: interval.id },
      data: {
        ...rest,
        ...(lastServiceDate !== undefined && {
          lastServiceDate: lastServiceDate
            ? new Date(lastServiceDate)
            : null,
        }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const interval = await this.findOne(id, userId);
    return this.prisma.serviceInterval.delete({
      where: { id: interval.id },
    });
  }

  private async findOne(id: string, userId: string) {
    const interval = await this.prisma.serviceInterval.findFirst({
      where: { id, vehicle: { userId } },
    });
    if (!interval)
      throw new NotFoundException('Service interval not found');
    return interval;
  }

  private async verifyVehicle(vehicleId: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }
}
