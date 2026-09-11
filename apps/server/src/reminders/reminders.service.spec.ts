import { Test } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

describe('RemindersService.sendVerificationReminders', () => {
  let service: RemindersService;
  let prisma: {
    user: { findMany: jest.Mock; update: jest.Mock };
    vehicle: { findMany: jest.Mock };
    expense: { groupBy: jest.Mock };
  };
  let mail: { sendVerificationReminder: jest.Mock; sendExpenseReminder: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findMany: jest.fn(), update: jest.fn() },
      vehicle: { findMany: jest.fn() },
      expense: { groupBy: jest.fn() },
    };
    mail = {
      sendVerificationReminder: jest.fn().mockResolvedValue(undefined),
      sendExpenseReminder: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mail },
      ],
    }).compile();

    service = module.get(RemindersService);
  });

  it('queries unverified users under the resend cap and past the cooldown', async () => {
    prisma.user.findMany.mockResolvedValue([]);

    await service.sendVerificationReminders();

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          emailVerified: false,
          verificationReminderCount: { lt: 3 },
        }),
      }),
    );
  });

  it('sends a reminder to each candidate and updates their counters', async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 'u1', email: 'u1@test.com', verifyToken: 'tok1' },
    ]);

    await service.sendVerificationReminders();

    expect(mail.sendVerificationReminder).toHaveBeenCalledWith('u1@test.com', 'tok1');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: {
        verificationReminderCount: { increment: 1 },
        lastVerificationReminderAt: expect.any(Date),
      },
    });
  });

  it('does not update counters when the send fails, so the next run retries', async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 'u1', email: 'u1@test.com', verifyToken: 'tok1' },
    ]);
    mail.sendVerificationReminder.mockRejectedValue(new Error('smtp down'));

    await service.sendVerificationReminders();

    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
