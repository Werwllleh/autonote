import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getLastActivityDates } from '../common/user-activity.util';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [userCount, vehicleCount, expenseCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vehicle.count(),
      this.prisma.expense.count(),
    ]);

    const totalAmount = await this.prisma.expense.aggregate({
      _sum: { amount: true },
    });

    const recentUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return {
      userCount,
      vehicleCount,
      expenseCount,
      totalAmount: totalAmount._sum.amount || 0,
      recentUsers,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string, unverifiedOnly?: boolean) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    if (unverifiedOnly) {
      where.emailVerified = false;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true,
          lastLoginAt: true,
          _count: { select: { vehicles: true, categories: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Get expense counts and totals per user
    const userIds = users.map((u) => u.id);
    const expenseStats = await this.prisma.expense.groupBy({
      by: ['vehicleId'],
      where: { vehicle: { userId: { in: userIds } } },
      _count: true,
      _sum: { amount: true },
    });

    // Map vehicle -> user
    const vehicles = await this.prisma.vehicle.findMany({
      where: { userId: { in: userIds } },
      select: { id: true, userId: true },
    });
    const vehicleToUser = new Map(vehicles.map((v) => [v.id, v.userId]));

    const userExpenseMap = new Map<
      string,
      { count: number; total: number }
    >();
    for (const stat of expenseStats) {
      const userId = vehicleToUser.get(stat.vehicleId);
      if (!userId) continue;
      const cur = userExpenseMap.get(userId) || { count: 0, total: 0 };
      cur.count += stat._count;
      cur.total += stat._sum.amount || 0;
      userExpenseMap.set(userId, cur);
    }

    const activityMap = await getLastActivityDates(this.prisma, userIds);

    const enriched = users.map((u) => {
      const expStat = userExpenseMap.get(u.id);
      return {
        ...u,
        vehicleCount: u._count.vehicles,
        expenseCount: expStat?.count || 0,
        expenseTotal: expStat?.total || 0,
        lastActivityAt: activityMap.get(u.id) ?? null,
      };
    });

    return { users: enriched, total, page, limit };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        lastLoginAt: true,
        vehicles: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            mileage: true,
            _count: { select: { expenses: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const activityMap = await getLastActivityDates(this.prisma, [id]);

    return { ...user, lastActivityAt: activityMap.get(id) ?? null };
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Cascade deletes vehicles, expenses, categories via Prisma relations
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }
}
