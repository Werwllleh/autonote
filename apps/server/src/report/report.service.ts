import {
  Injectable,
  NotFoundException,
  GoneException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async create(vehicleId: string, userId: string) {
    // Verify vehicle belongs to user
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const report = await this.prisma.publicReport.create({
      data: { token, expiresAt, vehicleId },
    });

    return {
      token: report.token,
      expiresAt: report.expiresAt.toISOString(),
      url: `https://my.auto-notes.ru/report/${report.token}`,
    };
  }

  async getReport(token: string) {
    const report = await this.prisma.publicReport.findUnique({
      where: { token },
    });
    if (!report) throw new NotFoundException('Отчёт не найден');

    if (report.expiresAt < new Date()) {
      // Clean up expired report
      await this.prisma.publicReport.delete({ where: { id: report.id } });
      throw new GoneException('Ссылка истекла');
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: report.vehicleId },
      select: {
        brand: true,
        model: true,
        year: true,
        mileage: true,
        initialMileage: true,
        photo: true,
        vin: true,
        purchaseDate: true,
      },
    });
    if (!vehicle) throw new NotFoundException('Автомобиль не найден');

    const expenses = await this.prisma.expense.findMany({
      where: { vehicleId: report.vehicleId },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    const inventoryParts = await this.prisma.part.findMany({
      where: { vehicleId: report.vehicleId },
      select: {
        name: true,
        article: true,
        quantity: true,
        price: true,
      },
      orderBy: { name: 'asc' },
    });

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

    // Last recorded mileage from expenses (fallback to vehicle.mileage)
    const maxMileage = expenses.reduce(
      (max, e) => (e.mileage && e.mileage > max ? e.mileage : max),
      vehicle.mileage,
    );

    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      byCategory[e.category.name] =
        (byCategory[e.category.name] || 0) + e.amount;
    }

    return {
      vehicle: { ...vehicle, mileage: maxMileage },
      expenses: expenses.map((e) => ({
        date: e.date.toISOString(),
        category: e.category.name,
        categorySlug: e.category.slug,
        amount: e.amount,
        description: e.description,
        mileage: e.mileage,
        parts: e.parts,
        laborCost: e.laborCost,
        liters: e.liters,
        pricePerLiter: e.pricePerLiter,
        bonuses: e.bonuses,
        dateFrom: e.dateFrom ? e.dateFrom.toISOString() : null,
        dateTo: e.dateTo ? e.dateTo.toISOString() : null,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
      totalSpent,
      byCategory,
      expenseCount: expenses.length,
      inventoryParts,
      inventoryTotal: inventoryParts.reduce(
        (s, p) => s + p.quantity * p.price,
        0,
      ),
      expiresAt: report.expiresAt.toISOString(),
    };
  }

  async revoke(token: string, userId: string) {
    const report = await this.prisma.publicReport.findUnique({
      where: { token },
      include: { vehicle: { select: { userId: true } } },
    });
    if (!report) throw new NotFoundException('Report not found');
    if (report.vehicle.userId !== userId) {
      throw new NotFoundException('Report not found');
    }

    await this.prisma.publicReport.delete({ where: { id: report.id } });
    return { revoked: true };
  }
}
