import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getVehicleStats(vehicleId: string, userId: string) {
    // Verify ownership
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });
    if (!vehicle) return null;

    const expenses = await this.prisma.expense.findMany({
      where: { vehicleId },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    // By category
    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      byCategory[e.category.name] =
        (byCategory[e.category.name] || 0) + e.amount;
    }

    // By month
    const byMonth: Record<string, number> = {};
    for (const e of expenses) {
      const key = e.date.toISOString().slice(0, 7); // YYYY-MM
      byMonth[key] = (byMonth[key] || 0) + e.amount;
    }

    // Fuel consumption (expenses with mileage in fuel category)
    const fuelExpenses = expenses
      .filter(
        (e) =>
          e.category.slug === 'fuel' && e.mileage !== null && e.mileage > 0,
      )
      .sort((a, b) => a.mileage! - b.mileage!);

    let avgFuelCostPer100km: number | null = null;
    if (fuelExpenses.length >= 2) {
      const first = fuelExpenses[0];
      const last = fuelExpenses[fuelExpenses.length - 1];
      const distanceKm = last.mileage! - first.mileage!;
      if (distanceKm > 0) {
        const totalFuelCost = fuelExpenses
          .slice(1)
          .reduce((s, e) => s + e.amount, 0);
        avgFuelCostPer100km = Math.round((totalFuelCost / distanceKm) * 100);
      }
    }

    const total = expenses.reduce((s, e) => s + e.amount, 0);

    return {
      total,
      count: expenses.length,
      byCategory,
      byMonth,
      avgFuelCostPer100km,
    };
  }

  async getOverallStats(userId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: { vehicle: { userId } },
      include: { category: true, vehicle: true },
      orderBy: { date: 'asc' },
    });

    const total = expenses.reduce((s, e) => s + e.amount, 0);

    const byCategory: Record<string, number> = {};
    for (const e of expenses) {
      byCategory[e.category.name] =
        (byCategory[e.category.name] || 0) + e.amount;
    }

    const byMonth: Record<string, number> = {};
    for (const e of expenses) {
      const key = e.date.toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + e.amount;
    }

    const byVehicle: Record<string, { name: string; total: number }> = {};
    for (const e of expenses) {
      const key = e.vehicleId;
      if (!byVehicle[key]) {
        byVehicle[key] = {
          name: `${e.vehicle.brand} ${e.vehicle.model}`,
          total: 0,
        };
      }
      byVehicle[key].total += e.amount;
    }

    return {
      total,
      count: expenses.length,
      byCategory,
      byMonth,
      byVehicle,
    };
  }
}
