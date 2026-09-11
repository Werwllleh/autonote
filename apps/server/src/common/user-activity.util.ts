import { PrismaService } from '../prisma/prisma.service';

export async function getLastActivityDates(
  prisma: PrismaService,
  userIds: string[],
): Promise<Map<string, Date | null>> {
  const activity = new Map<string, Date | null>();
  for (const id of userIds) activity.set(id, null);
  if (userIds.length === 0) return activity;

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: { in: userIds } },
    select: { id: true, userId: true, createdAt: true },
  });
  const vehicleToUser = new Map(vehicles.map((v) => [v.id, v.userId]));

  for (const v of vehicles) {
    const current = activity.get(v.userId);
    if (!current || v.createdAt > current) activity.set(v.userId, v.createdAt);
  }

  const vehicleIds = vehicles.map((v) => v.id);
  if (vehicleIds.length > 0) {
    const expenseMax = await prisma.expense.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { in: vehicleIds } },
      _max: { date: true, createdAt: true },
    });

    for (const stat of expenseMax) {
      const userId = vehicleToUser.get(stat.vehicleId);
      if (!userId) continue;
      // Take the max of both the user-entered date and the row's createdAt,
      // so backdated entries (catching up a paper logbook) don't make a
      // freshly-created expense look stale.
      const candidates = [stat._max.date, stat._max.createdAt].filter(
        (d): d is Date => d != null,
      );
      if (candidates.length === 0) continue;
      const latest = candidates.reduce((a, b) => (b > a ? b : a));
      const current = activity.get(userId);
      if (!current || latest > current) activity.set(userId, latest);
    }
  }

  return activity;
}
