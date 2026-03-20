import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getVehicleStats(vehicleId: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });
    if (!vehicle) return null;

    const expenses = await this.prisma.expense.findMany({
      where: { vehicleId },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

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

    // Fuel cost per 100km
    const fuelExpenses = expenses
      .filter(
        (e) =>
          e.category.slug === 'fuel' && e.mileage !== null && e.mileage > 0,
      )
      .sort((a, b) => a.mileage! - b.mileage!);

    let avgFuelCostPer100km: number | null = null;
    let avgLitersPer100km: number | null = null;

    if (fuelExpenses.length >= 2) {
      const first = fuelExpenses[0];
      const last = fuelExpenses[fuelExpenses.length - 1];
      const distanceKm = last.mileage! - first.mileage!;
      if (distanceKm > 0) {
        const totalFuelCost = fuelExpenses
          .slice(1)
          .reduce((s, e) => s + e.amount, 0);
        avgFuelCostPer100km = Math.round((totalFuelCost / distanceKm) * 100);

        const totalLiters = fuelExpenses
          .slice(1)
          .reduce((s, e) => s + (e.liters || 0), 0);
        if (totalLiters > 0) {
          avgLitersPer100km =
            Math.round((totalLiters / distanceKm) * 100 * 10) / 10;
        }
      }
    }

    const total = expenses.reduce((s, e) => s + e.amount, 0);

    // Month comparison
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthTotal = byMonth[currentMonthKey] || 0;
    const prevMonthTotal = byMonth[prevMonthKey] || 0;

    // Forecast
    const monthKeys = Object.keys(byMonth).sort();
    let monthlyAvg = 0;
    if (monthKeys.length > 0) {
      monthlyAvg = total / monthKeys.length;
    }

    // Cost per km
    const costPerKm =
      vehicle.mileage > 0 ? Math.round((total / vehicle.mileage) * 100) / 100 : null;

    return {
      total,
      count: expenses.length,
      byCategory,
      byMonth,
      avgFuelCostPer100km,
      avgLitersPer100km,
      currentMonthTotal,
      prevMonthTotal,
      monthlyAvg: Math.round(monthlyAvg),
      yearlyForecast: Math.round(monthlyAvg * 12),
      costPerKm,
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

    // Month comparison
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthTotal = byMonth[currentMonthKey] || 0;
    const prevMonthTotal = byMonth[prevMonthKey] || 0;

    return {
      total,
      count: expenses.length,
      byCategory,
      byMonth,
      byVehicle,
      currentMonthTotal,
      prevMonthTotal,
    };
  }

  async getRecentExpenses(userId: string, limit = 5) {
    return this.prisma.expense.findMany({
      where: { vehicle: { userId } },
      include: { category: true, vehicle: true },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  async getReminders(userId: string) {
    const reminders: {
      type: 'insurance' | 'service';
      title: string;
      vehicleId: string;
      vehicleName: string;
      dueDate?: string;
      dueKm?: number;
      urgency: 'info' | 'warning' | 'critical';
    }[] = [];

    const now = new Date();
    const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Insurance expiring
    const insuranceExpenses = await this.prisma.expense.findMany({
      where: {
        vehicle: { userId },
        category: { slug: 'insurance' },
        dateTo: { not: null },
      },
      include: { vehicle: true, category: true },
      orderBy: { dateTo: 'desc' },
    });

    // Group by vehicle — only latest per vehicle
    const latestInsurance = new Map<
      string,
      (typeof insuranceExpenses)[0]
    >();
    for (const e of insuranceExpenses) {
      if (!latestInsurance.has(e.vehicleId)) {
        latestInsurance.set(e.vehicleId, e);
      }
    }

    for (const [, e] of latestInsurance) {
      if (!e.dateTo) continue;
      const vehicleName = `${e.vehicle.brand} ${e.vehicle.model}`;
      if (e.dateTo < now) {
        reminders.push({
          type: 'insurance',
          title: `Страховка истекла ${e.dateTo.toLocaleDateString('ru-RU')}`,
          vehicleId: e.vehicleId,
          vehicleName,
          dueDate: e.dateTo.toISOString(),
          urgency: 'critical',
        });
      } else if (e.dateTo <= in30days) {
        reminders.push({
          type: 'insurance',
          title: `Страховка истекает ${e.dateTo.toLocaleDateString('ru-RU')}`,
          vehicleId: e.vehicleId,
          vehicleName,
          dueDate: e.dateTo.toISOString(),
          urgency: 'warning',
        });
      }
    }

    // Service intervals
    const vehicles = await this.prisma.vehicle.findMany({
      where: { userId },
      include: { serviceIntervals: true },
    });

    for (const v of vehicles) {
      const vehicleName = `${v.brand} ${v.model}`;
      for (const si of v.serviceIntervals) {
        // Check by km
        if (si.intervalKm && si.lastServiceMileage !== null) {
          const nextKm = si.lastServiceMileage + si.intervalKm;
          const remaining = nextKm - v.mileage;
          if (remaining <= 0) {
            reminders.push({
              type: 'service',
              title: `${si.name}: просрочено на ${Math.abs(remaining)} км`,
              vehicleId: v.id,
              vehicleName,
              dueKm: nextKm,
              urgency: 'critical',
            });
          } else if (remaining <= si.intervalKm * 0.1) {
            reminders.push({
              type: 'service',
              title: `${si.name}: осталось ${remaining} км`,
              vehicleId: v.id,
              vehicleName,
              dueKm: nextKm,
              urgency: 'warning',
            });
          }
        }

        // Check by months
        if (si.intervalMonths && si.lastServiceDate) {
          const nextDate = new Date(si.lastServiceDate);
          nextDate.setMonth(nextDate.getMonth() + si.intervalMonths);
          if (nextDate < now) {
            reminders.push({
              type: 'service',
              title: `${si.name}: просрочено с ${nextDate.toLocaleDateString('ru-RU')}`,
              vehicleId: v.id,
              vehicleName,
              dueDate: nextDate.toISOString(),
              urgency: 'critical',
            });
          } else if (nextDate <= in30days) {
            reminders.push({
              type: 'service',
              title: `${si.name}: до ${nextDate.toLocaleDateString('ru-RU')}`,
              vehicleId: v.id,
              vehicleName,
              dueDate: nextDate.toISOString(),
              urgency: 'warning',
            });
          }
        }
      }
    }

    // Sort: critical first, then warning, then info
    const urgencyOrder = { critical: 0, warning: 1, info: 2 };
    reminders.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    return reminders;
  }
}
