import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { getLastActivityDates } from '../common/user-activity.util';

const VERIFICATION_REMINDER_INTERVAL_DAYS = 3;
const VERIFICATION_REMINDER_MAX_COUNT = 3;
const EXPENSE_REMINDER_INTERVAL_DAYS = 14;
const EXPENSE_REMINDER_MAX_COUNT = 5;

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendVerificationReminders() {
    const cutoff = daysAgo(VERIFICATION_REMINDER_INTERVAL_DAYS);

    const candidates = await this.prisma.user.findMany({
      where: {
        emailVerified: false,
        createdAt: { lte: cutoff },
        verificationReminderCount: { lt: VERIFICATION_REMINDER_MAX_COUNT },
        OR: [
          { lastVerificationReminderAt: null },
          { lastVerificationReminderAt: { lte: cutoff } },
        ],
      },
      select: { id: true, email: true, verifyToken: true },
    });

    for (const user of candidates) {
      if (!user.verifyToken) continue;

      try {
        await this.mail.sendVerificationReminder(user.email, user.verifyToken);
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            verificationReminderCount: { increment: 1 },
            lastVerificationReminderAt: new Date(),
          },
        });
      } catch (err) {
        this.logger.error(
          `Failed to send verification reminder to ${user.email}: ${(err as Error).message}`,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendExpenseReminders() {
    const cutoff = daysAgo(EXPENSE_REMINDER_INTERVAL_DAYS);

    const candidates = await this.prisma.user.findMany({
      where: {
        emailVerified: true,
        expenseRemindersEnabled: true,
        expenseReminderCount: { lt: EXPENSE_REMINDER_MAX_COUNT },
        vehicles: { some: {} },
        OR: [
          { lastExpenseReminderAt: null },
          { lastExpenseReminderAt: { lte: cutoff } },
        ],
      },
      select: { id: true, email: true },
    });
    if (candidates.length === 0) return;

    const activity = await getLastActivityDates(
      this.prisma,
      candidates.map((c) => c.id),
    );

    for (const user of candidates) {
      const lastActivity = activity.get(user.id);
      if (!lastActivity || lastActivity > cutoff) continue;

      try {
        await this.mail.sendExpenseReminder(user.email);
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            expenseReminderCount: { increment: 1 },
            lastExpenseReminderAt: new Date(),
          },
        });
      } catch (err) {
        this.logger.error(
          `Failed to send expense reminder to ${user.email}: ${(err as Error).message}`,
        );
      }
    }
  }
}
