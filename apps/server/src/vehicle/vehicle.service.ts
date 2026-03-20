import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

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
    const { purchaseDate, ...rest } = dto;
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...rest,
        ...(purchaseDate !== undefined && {
          purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        }),
      },
    });
  }

  async uploadPhoto(id: string, userId: string, file: Express.Multer.File) {
    const vehicle = await this.findOne(id, userId);

    if (vehicle.photo) {
      await this.uploadService.removeImage(vehicle.photo);
    }

    const url = await this.uploadService.processImage(file, 'vehicles', 1200);

    return this.prisma.vehicle.update({
      where: { id },
      data: { photo: url },
    });
  }

  async removePhoto(id: string, userId: string) {
    const vehicle = await this.findOne(id, userId);

    if (vehicle.photo) {
      await this.uploadService.removeImage(vehicle.photo);
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: { photo: null },
    });
  }

  async remove(id: string, userId: string) {
    const vehicle = await this.findOne(id, userId);
    if (vehicle.photo) {
      await this.uploadService.removeImage(vehicle.photo);
    }
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
