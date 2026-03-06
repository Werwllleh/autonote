import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string, vehicleId?: string) {
    return this.prisma.expense.findMany({
      where: {
        vehicle: { userId },
        ...(vehicleId && { vehicleId }),
      },
      include: { category: true, vehicle: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, vehicle: { userId } },
      include: { category: true, vehicle: true },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async create(dto: CreateExpenseDto, userId: string) {
    // Verify vehicle belongs to user
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, userId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    return this.prisma.expense.create({
      data: {
        amount: dto.amount,
        date: new Date(dto.date),
        description: dto.description,
        mileage: dto.mileage,
        vehicleId: dto.vehicleId,
        categoryId: dto.categoryId,
        liters: dto.liters,
        pricePerLiter: dto.pricePerLiter,
        bonuses: dto.bonuses,
        parts: dto.parts ? (dto.parts as unknown as Prisma.InputJsonValue) : undefined,
        laborCost: dto.laborCost,
      },
      include: { category: true, vehicle: true },
    });
  }

  async update(id: string, dto: UpdateExpenseDto, userId: string) {
    await this.findOne(id, userId);

    const data: Prisma.ExpenseUncheckedUpdateInput = {
      date: dto.date ? new Date(dto.date) : undefined,
      amount: dto.amount,
      description: dto.description,
      mileage: dto.mileage,
      vehicleId: dto.vehicleId,
      categoryId: dto.categoryId,
      liters: dto.liters,
      pricePerLiter: dto.pricePerLiter,
      bonuses: dto.bonuses,
      laborCost: dto.laborCost,
    };

    if (dto.parts === null) {
      data.parts = Prisma.DbNull;
    } else if (dto.parts) {
      data.parts = dto.parts as unknown as Prisma.InputJsonValue;
    }

    return this.prisma.expense.update({
      where: { id },
      data,
      include: { category: true, vehicle: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.expense.delete({ where: { id } });
  }
}
