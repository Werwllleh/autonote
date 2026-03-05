import { Injectable, NotFoundException } from '@nestjs/common';
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
      },
      include: { category: true, vehicle: true },
    });
  }

  async update(id: string, dto: UpdateExpenseDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: { category: true, vehicle: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.expense.delete({ where: { id } });
  }
}
