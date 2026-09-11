# Automated Email Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically email users who haven't verified their address (transactional, non-optional) and nudge verified users with a vehicle but no recent expenses (opt-out engagement email), via a new daily cron job.

**Architecture:** A new `RemindersModule` (NestJS `@nestjs/schedule`) runs two daily `@Cron` jobs in `RemindersService`. Both query `User` via Prisma, reuse a shared `getLastActivityDates` utility for the expense job, and send mail through two new `MailService` methods. Six new nullable/defaulted columns on `User` track counts and last-sent timestamps to cap and de-duplicate sends. A new `PUT /user/notification-settings` endpoint plus a profile-page toggle let users opt out of the expense nudge only — the verification reminder is never opt-out.

**Tech Stack:** NestJS 11, Prisma 6 (PostgreSQL), `@nestjs/schedule` (new dependency), nodemailer, Jest/ts-jest (server unit tests), React + TanStack Query + shadcn/ui (client).

**Spec:** `docs/superpowers/specs/2026-09-11-email-reminders-design.md`

## Global Constraints

- Verification reminder: every 3 days, capped at 3 sends, never opt-out.
- Expense nudge: after 14 days of inactivity, capped at 5 sends, resets to 0 when the user adds a new expense, opt-out via `User.expenseRemindersEnabled` (default `true`).
- All new server code ships with Jest unit tests using mocked `PrismaService`/`MailService` (this repo has zero existing unit tests — these tasks establish the pattern; follow it exactly for consistency).
- Run all server commands from `apps/server/` unless noted; run Prisma migration commands from the repo root (`/home/alex/apps/main/autonote`) via the existing `npm run db:migrate` script.
- No frontend test runner exists in this repo (Vite/React only) — the frontend task is verified by `tsc` build + manual check, not TDD.

---

### Task 1: Add reminder-tracking fields to the `User` model

**Files:**
- Modify: `apps/server/prisma/schema.prisma:15-31` (`User` model)

**Interfaces:**
- Produces: `User.lastLoginAt: Date | null`, `User.lastVerificationReminderAt: Date | null`, `User.verificationReminderCount: number`, `User.lastExpenseReminderAt: Date | null`, `User.expenseReminderCount: number`, `User.expenseRemindersEnabled: boolean` — used by every later task in this plan.

- [ ] **Step 1: Add the new fields to the `User` model**

Edit `apps/server/prisma/schema.prisma`, inside `model User { ... }`, right after the existing `updatedAt` line:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  avatar    String?
  role          UserRole @default(USER)
  emailVerified Boolean  @default(false) @map("email_verified")
  verifyToken   String?  @unique @map("verify_token")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  lastLoginAt                DateTime? @map("last_login_at")
  lastVerificationReminderAt DateTime? @map("last_verification_reminder_at")
  verificationReminderCount  Int       @default(0) @map("verification_reminder_count")
  lastExpenseReminderAt      DateTime? @map("last_expense_reminder_at")
  expenseReminderCount       Int       @default(0) @map("expense_reminder_count")
  expenseRemindersEnabled    Boolean   @default(true) @map("expense_reminders_enabled")

  vehicles   Vehicle[]
  categories Category[]

  @@map("users")
}
```

- [ ] **Step 2: Create and apply the migration**

Run from the repo root:

```bash
cd /home/alex/apps/main/autonote
npm run db:migrate -- --name add_reminder_fields
```

Expected: Prisma prints `Your database is now in sync with your schema` and creates a new folder under `apps/server/prisma/migrations/`.

- [ ] **Step 3: Regenerate the Prisma client**

```bash
npm run db:generate
```

Expected: `Generated Prisma Client` with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/server/prisma/schema.prisma apps/server/prisma/migrations
git commit -m "$(cat <<'EOF'
feat(db): add reminder-tracking fields to User

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JVnJN5uHQhPZ7UTdFNEErS
EOF
)"
```

---

### Task 2: Shared "last activity" utility

**Files:**
- Create: `apps/server/src/common/user-activity.util.ts`
- Test: `apps/server/src/common/user-activity.util.spec.ts`

**Interfaces:**
- Consumes: `PrismaService` (from Task 1's regenerated client — needs no new fields itself, just `vehicle.findMany` / `expense.groupBy`, but must run after Task 1 so the workspace compiles).
- Produces: `getLastActivityDates(prisma: PrismaService, userIds: string[]): Promise<Map<string, Date | null>>` — used by Task 5 (`RemindersService.sendExpenseReminders`) and, later, by the separate admin-panel epic (autonote-rkf).

- [ ] **Step 1: Write the failing tests**

Create `apps/server/src/common/user-activity.util.spec.ts`:

```ts
import { getLastActivityDates } from './user-activity.util';
import { PrismaService } from '../prisma/prisma.service';

describe('getLastActivityDates', () => {
  let prisma: { vehicle: { findMany: jest.Mock }; expense: { groupBy: jest.Mock } };

  beforeEach(() => {
    prisma = {
      vehicle: { findMany: jest.fn() },
      expense: { groupBy: jest.fn() },
    };
  });

  it('returns null for a user with no vehicles', async () => {
    prisma.vehicle.findMany.mockResolvedValue([]);

    const result = await getLastActivityDates(prisma as unknown as PrismaService, ['u1']);

    expect(result.get('u1')).toBeNull();
    expect(prisma.expense.groupBy).not.toHaveBeenCalled();
  });

  it('uses vehicle.createdAt when the vehicle has no expenses', async () => {
    const createdAt = new Date('2026-01-01');
    prisma.vehicle.findMany.mockResolvedValue([
      { id: 'v1', userId: 'u1', createdAt },
    ]);
    prisma.expense.groupBy.mockResolvedValue([]);

    const result = await getLastActivityDates(prisma as unknown as PrismaService, ['u1']);

    expect(result.get('u1')).toEqual(createdAt);
  });

  it('uses the latest expense date when it is more recent than the vehicle creation date', async () => {
    const createdAt = new Date('2026-01-01');
    const expenseDate = new Date('2026-03-01');
    prisma.vehicle.findMany.mockResolvedValue([
      { id: 'v1', userId: 'u1', createdAt },
    ]);
    prisma.expense.groupBy.mockResolvedValue([
      { vehicleId: 'v1', _max: { date: expenseDate } },
    ]);

    const result = await getLastActivityDates(prisma as unknown as PrismaService, ['u1']);

    expect(result.get('u1')).toEqual(expenseDate);
  });

  it('computes activity independently per user', async () => {
    const oldDate = new Date('2025-01-01');
    const newDate = new Date('2026-06-01');
    prisma.vehicle.findMany.mockResolvedValue([
      { id: 'v1', userId: 'u1', createdAt: oldDate },
      { id: 'v2', userId: 'u2', createdAt: newDate },
    ]);
    prisma.expense.groupBy.mockResolvedValue([]);

    const result = await getLastActivityDates(prisma as unknown as PrismaService, ['u1', 'u2']);

    expect(result.get('u1')).toEqual(oldDate);
    expect(result.get('u2')).toEqual(newDate);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd apps/server && npx jest user-activity.util.spec.ts
```

Expected: FAIL — `Cannot find module './user-activity.util'`.

- [ ] **Step 3: Implement the utility**

Create `apps/server/src/common/user-activity.util.ts`:

```ts
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
      _max: { date: true },
    });

    for (const stat of expenseMax) {
      const userId = vehicleToUser.get(stat.vehicleId);
      if (!userId || !stat._max.date) continue;
      const current = activity.get(userId);
      if (!current || stat._max.date > current) activity.set(userId, stat._max.date);
    }
  }

  return activity;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest user-activity.util.spec.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/common/user-activity.util.ts apps/server/src/common/user-activity.util.spec.ts
git commit -m "$(cat <<'EOF'
feat: add shared user last-activity utility

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JVnJN5uHQhPZ7UTdFNEErS
EOF
)"
```

---

### Task 3: `MailService` reminder emails

**Files:**
- Modify: `apps/server/src/mail/mail.service.ts` (add two methods after `sendVerification`)
- Test: `apps/server/src/mail/mail.service.spec.ts`

**Interfaces:**
- Produces: `MailService.sendVerificationReminder(to: string, token: string): Promise<void>`, `MailService.sendExpenseReminder(to: string): Promise<void>` — used by Task 4 and Task 5.

- [ ] **Step 1: Write the failing tests**

Create `apps/server/src/mail/mail.service.spec.ts`:

```ts
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer');

describe('MailService reminders', () => {
  let service: MailService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue(undefined);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    service = module.get(MailService);
  });

  it('sendVerificationReminder emails the verify link to the given address', async () => {
    await service.sendVerificationReminder('user@test.com', 'tok123');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: expect.stringContaining('Подтвердите'),
        html: expect.stringContaining('tok123'),
      }),
    );
  });

  it('sendExpenseReminder emails a nudge to the given address', async () => {
    await service.sendExpenseReminder('user@test.com');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: expect.stringContaining('расход'),
      }),
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest mail.service.spec.ts
```

Expected: FAIL — `service.sendVerificationReminder is not a function`.

- [ ] **Step 3: Implement the two methods**

Add to `apps/server/src/mail/mail.service.ts`, inside the `MailService` class, after the closing brace of `sendVerification`:

```ts
  async sendVerificationReminder(to: string, token: string) {
    const url = `https://my.auto-notes.ru/verify?token=${token}`;

    await this.transporter.sendMail({
      from: `AutoNotes <${this.from}>`,
      to,
      subject: 'Напоминание: подтвердите email — AutoNotes',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #18181b; border-radius: 12px; line-height: 48px; color: white; font-size: 20px;">🚗</div>
            <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b;">AutoNotes</h1>
          </div>
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
            Вы ещё не подтвердили email. Без подтверждения часть возможностей AutoNotes недоступна — нажмите кнопку ниже:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="display: inline-block; background: #18181b; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
              Подтвердить email
            </a>
          </div>
          <p style="color: #71717a; font-size: 13px; line-height: 1.5;">
            Если кнопка не работает, скопируйте ссылку:<br>
            <a href="${url}" style="color: #3b82f6; word-break: break-all;">${url}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
          <p style="color: #a1a1aa; font-size: 12px;">
            Если вы не регистрировались в AutoNotes, просто проигнорируйте это письмо.
          </p>
        </div>
      `,
    });
  }

  async sendExpenseReminder(to: string) {
    const url = 'https://my.auto-notes.ru/expenses';

    await this.transporter.sendMail({
      from: `AutoNotes <${this.from}>`,
      to,
      subject: 'Давно не было новых расходов — AutoNotes',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #18181b; border-radius: 12px; line-height: 48px; color: white; font-size: 20px;">🚗</div>
            <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b;">AutoNotes</h1>
          </div>
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
            Вы давно не добавляли расходы по своему автомобилю. Загляните в AutoNotes и внесите последние траты, чтобы история оставалась полной:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="display: inline-block; background: #18181b; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
              Добавить расход
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
          <p style="color: #a1a1aa; font-size: 12px;">
            Не хотите получать такие письма? Отключите их в настройках профиля — «Уведомления».
          </p>
        </div>
      `,
    });
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest mail.service.spec.ts
```

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/mail/mail.service.ts apps/server/src/mail/mail.service.spec.ts
git commit -m "$(cat <<'EOF'
feat: add reminder email templates to MailService

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JVnJN5uHQhPZ7UTdFNEErS
EOF
)"
```

---

### Task 4: `RemindersModule` + verification-reminder cron job

**Files:**
- Create: `apps/server/src/reminders/reminders.service.ts`
- Create: `apps/server/src/reminders/reminders.module.ts`
- Test: `apps/server/src/reminders/reminders.service.spec.ts`
- Modify: `apps/server/package.json` (add `@nestjs/schedule`)
- Modify: `apps/server/src/app.module.ts` (register `ScheduleModule.forRoot()` and `RemindersModule`)

**Interfaces:**
- Consumes: `MailService.sendVerificationReminder` (Task 3).
- Produces: `RemindersService.sendVerificationReminders(): Promise<void>` — Task 5 adds a sibling method `sendExpenseReminders` to the same class.

- [ ] **Step 1: Install `@nestjs/schedule`**

```bash
cd apps/server && npm install @nestjs/schedule
```

Expected: added to `dependencies` in `apps/server/package.json`.

- [ ] **Step 2: Write the failing tests**

Create `apps/server/src/reminders/reminders.service.spec.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
npx jest reminders.service.spec.ts
```

Expected: FAIL — `Cannot find module './reminders.service'`.

- [ ] **Step 4: Implement `RemindersService` (verification reminder only)**

Create `apps/server/src/reminders/reminders.service.ts`:

```ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const VERIFICATION_REMINDER_INTERVAL_DAYS = 3;
const VERIFICATION_REMINDER_MAX_COUNT = 3;

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
}
```

Create `apps/server/src/reminders/reminders.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';

@Module({
  providers: [RemindersService],
})
export class RemindersModule {}
```

- [ ] **Step 5: Register `ScheduleModule` and `RemindersModule` in `AppModule`**

In `apps/server/src/app.module.ts`, add the import:

```ts
import { ScheduleModule } from '@nestjs/schedule';
```

and add `RemindersModule` next to the other feature module imports:

```ts
import { RemindersModule } from './reminders/reminders.module';
```

then add both to the `imports` array (alongside `ScheduleModule.forRoot()`):

```ts
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/api/uploads',
      serveStaticOptions: { index: false },
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    VehicleModule,
    CategoryModule,
    ExpenseModule,
    StatsModule,
    UploadModule,
    PartModule,
    ServiceIntervalModule,
    AdminModule,
    MailModule,
    ReportModule,
    RemindersModule,
  ],
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
npx jest reminders.service.spec.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 7: Verify the whole server still builds**

```bash
npm run build
```

Expected: exits 0, no TypeScript errors.

- [ ] **Step 8: Commit**

```bash
git add apps/server/package.json apps/server/package-lock.json apps/server/src/reminders apps/server/src/app.module.ts
git commit -m "$(cat <<'EOF'
feat: add RemindersModule with verification-reminder cron job

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JVnJN5uHQhPZ7UTdFNEErS
EOF
)"
```

---

### Task 5: Expense-nudge cron job

**Files:**
- Modify: `apps/server/src/reminders/reminders.service.ts` (add `sendExpenseReminders`)
- Modify: `apps/server/src/reminders/reminders.service.spec.ts` (add tests)

**Interfaces:**
- Consumes: `getLastActivityDates` (Task 2), `MailService.sendExpenseReminder` (Task 3).
- Produces: `RemindersService.sendExpenseReminders(): Promise<void>`.

- [ ] **Step 1: Write the failing tests**

Add to `apps/server/src/reminders/reminders.service.spec.ts`, a new `describe` block alongside the existing one (same `beforeEach` setup applies — add these tests inside the same top-level `describe('RemindersService', ...)`; first rename the existing outer `describe('RemindersService.sendVerificationReminders', ...)` to `describe('RemindersService', ...)` and nest the existing 3 tests under `describe('sendVerificationReminders', ...)`):

```ts
  describe('sendExpenseReminders', () => {
    it('queries verified users with reminders enabled, >=1 vehicle, under the cap', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.sendExpenseReminders();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            emailVerified: true,
            expenseRemindersEnabled: true,
            expenseReminderCount: { lt: 5 },
            vehicles: { some: {} },
          }),
        }),
      );
      expect(prisma.vehicle.findMany).not.toHaveBeenCalled();
    });

    it('sends a nudge to a user whose last activity is older than 14 days', async () => {
      const old = new Date();
      old.setDate(old.getDate() - 20);

      prisma.user.findMany.mockResolvedValue([{ id: 'u1', email: 'u1@test.com' }]);
      prisma.vehicle.findMany.mockResolvedValue([{ id: 'v1', userId: 'u1', createdAt: old }]);
      prisma.expense.groupBy.mockResolvedValue([]);

      await service.sendExpenseReminders();

      expect(mail.sendExpenseReminder).toHaveBeenCalledWith('u1@test.com');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          expenseReminderCount: { increment: 1 },
          lastExpenseReminderAt: expect.any(Date),
        },
      });
    });

    it('skips a user whose activity is within the last 14 days', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'u1', email: 'u1@test.com' }]);
      prisma.vehicle.findMany.mockResolvedValue([
        { id: 'v1', userId: 'u1', createdAt: new Date() },
      ]);
      prisma.expense.groupBy.mockResolvedValue([]);

      await service.sendExpenseReminders();

      expect(mail.sendExpenseReminder).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest reminders.service.spec.ts
```

Expected: FAIL — `service.sendExpenseReminders is not a function`.

- [ ] **Step 3: Implement `sendExpenseReminders`**

In `apps/server/src/reminders/reminders.service.ts`, add the import and the constants:

```ts
import { getLastActivityDates } from '../common/user-activity.util';
```

```ts
const EXPENSE_REMINDER_INTERVAL_DAYS = 14;
const EXPENSE_REMINDER_MAX_COUNT = 5;
```

and add this method inside the `RemindersService` class, after `sendVerificationReminders`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest reminders.service.spec.ts
```

Expected: PASS, 6 tests total.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/reminders/reminders.service.ts apps/server/src/reminders/reminders.service.spec.ts
git commit -m "$(cat <<'EOF'
feat: add expense-nudge cron job to RemindersService

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JVnJN5uHQhPZ7UTdFNEErS
EOF
)"
```

---

### Task 6: Track `lastLoginAt` on login

**Files:**
- Modify: `apps/server/src/auth/auth.service.ts:81-95` (`login` method)
- Test: `apps/server/src/auth/auth.service.spec.ts`

**Interfaces:**
- Produces: successful `AuthService.login()` now also persists `User.lastLoginAt`. No signature change — return type unchanged.

- [ ] **Step 1: Write the failing test**

Create `apps/server/src/auth/auth.service.spec.ts`:

```ts
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

jest.mock('bcrypt');

describe('AuthService.login', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn(), update: jest.fn() } };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token') } },
        { provide: ConfigService, useValue: { get: () => 'secret' } },
        { provide: MailService, useValue: { sendVerification: jest.fn() } },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('records lastLoginAt when credentials are valid and email is verified', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'u1@test.com',
      password: 'hashed',
      role: 'USER',
      emailVerified: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await service.login({ email: 'u1@test.com', password: 'plain' });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { lastLoginAt: expect.any(Date) },
    });
  });

  it('does not record lastLoginAt when the password is invalid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'u1@test.com',
      password: 'hashed',
      role: 'USER',
      emailVerified: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: 'u1@test.com', password: 'wrong' }),
    ).rejects.toThrow();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest auth.service.spec.ts
```

Expected: FAIL — `prisma.user.update` was not called (assertion failure), since `login` does not yet write `lastLoginAt`.

- [ ] **Step 3: Implement the change**

In `apps/server/src/auth/auth.service.ts`, replace the `login` method:

```ts
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.emailVerified) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest auth.service.spec.ts
```

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/auth/auth.service.ts apps/server/src/auth/auth.service.spec.ts
git commit -m "$(cat <<'EOF'
feat: record lastLoginAt on successful login

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JVnJN5uHQhPZ7UTdFNEErS
EOF
)"
```

---

### Task 7: Reset `expenseReminderCount` when a user adds an expense

**Files:**
- Modify: `apps/server/src/expense/expense.service.ts:40-70` (`create` method)
- Test: `apps/server/src/expense/expense.service.spec.ts`

**Interfaces:**
- Produces: `ExpenseService.create(dto, userId)` now also resets `User.expenseReminderCount` to `0` for the vehicle's owner. Return type unchanged.

- [ ] **Step 1: Write the failing test**

Create `apps/server/src/expense/expense.service.spec.ts`:

```ts
import { Test } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';
import { PartService } from '../part/part.service';

describe('ExpenseService.create', () => {
  let service: ExpenseService;
  let prisma: {
    vehicle: { findFirst: jest.Mock };
    expense: { create: jest.Mock };
    user: { update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      vehicle: { findFirst: jest.fn() },
      expense: { create: jest.fn() },
      user: { update: jest.fn() },
    };

    const module = await Test.createTestingModule({
      providers: [
        ExpenseService,
        { provide: PrismaService, useValue: prisma },
        { provide: PartService, useValue: { deductStock: jest.fn() } },
      ],
    }).compile();

    service = module.get(ExpenseService);
  });

  it('resets the owning user expenseReminderCount after creating an expense', async () => {
    prisma.vehicle.findFirst.mockResolvedValue({ id: 'v1', userId: 'u1' });
    prisma.expense.create.mockResolvedValue({ id: 'e1' });

    await service.create(
      { amount: 100, date: '2026-01-01', vehicleId: 'v1', categoryId: 'c1' } as any,
      'u1',
    );

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { expenseReminderCount: 0 },
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest expense.service.spec.ts
```

Expected: FAIL — `prisma.user.update` not called.

- [ ] **Step 3: Implement the change**

In `apps/server/src/expense/expense.service.ts`, replace the `create` method body's final `return this.prisma.expense.create(...)` with a captured result plus the reset:

```ts
  async create(dto: CreateExpenseDto, userId: string) {
    // Verify vehicle belongs to user
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, userId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Deduct stock parts if provided
    if (dto.stockParts?.length) {
      await this.partService.deductStock(dto.stockParts, userId);
    }

    const expense = await this.prisma.expense.create({
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
        dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
        dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
      },
      include: { category: true, vehicle: true },
    });

    await this.prisma.user.update({
      where: { id: vehicle.userId },
      data: { expenseReminderCount: 0 },
    });

    return expense;
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest expense.service.spec.ts
```

Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/expense/expense.service.ts apps/server/src/expense/expense.service.spec.ts
git commit -m "$(cat <<'EOF'
feat: reset expenseReminderCount when a new expense is logged

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JVnJN5uHQhPZ7UTdFNEErS
EOF
)"
```

---

### Task 8: User notification-settings endpoint

**Files:**
- Modify: `apps/server/src/user/dto/update-profile.dto.ts` (add `UpdateNotificationSettingsDto`)
- Modify: `apps/server/src/user/user.service.ts` (add `updateNotificationSettings`, extend `getProfile` select)
- Modify: `apps/server/src/user/user.controller.ts` (add `PUT /user/notification-settings`)
- Test: `apps/server/src/user/user.service.spec.ts`

**Interfaces:**
- Produces: `UserService.updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto): Promise<{ id, email, name, avatar, expenseRemindersEnabled }>`; `UserService.getProfile` result now also includes `expenseRemindersEnabled: boolean`. Consumed by Task 9's frontend API layer as `PUT /user/notification-settings`.

- [ ] **Step 1: Write the failing tests**

Create `apps/server/src/user/user.service.spec.ts`:

```ts
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn(), update: jest.fn() } };

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: UploadService, useValue: {} },
      ],
    }).compile();

    service = module.get(UserService);
  });

  describe('getProfile', () => {
    it('includes expenseRemindersEnabled in the selected fields', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'u1@test.com',
        name: null,
        avatar: null,
        createdAt: new Date(),
        expenseRemindersEnabled: false,
      });

      const result = await service.getProfile('u1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({ expenseRemindersEnabled: true }),
        }),
      );
      expect(result.expenseRemindersEnabled).toBe(false);
    });
  });

  describe('updateNotificationSettings', () => {
    it('updates expenseRemindersEnabled for the given user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.user.update.mockResolvedValue({ id: 'u1', expenseRemindersEnabled: false });

      await service.updateNotificationSettings('u1', { expenseRemindersEnabled: false });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { expenseRemindersEnabled: false },
        select: expect.objectContaining({ expenseRemindersEnabled: true }),
      });
    });

    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateNotificationSettings('missing', { expenseRemindersEnabled: true }),
      ).rejects.toThrow('User not found');
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest user.service.spec.ts
```

Expected: FAIL — `service.updateNotificationSettings is not a function`, and the `getProfile` assertion fails since `expenseRemindersEnabled` isn't in today's select.

- [ ] **Step 3: Add the DTO**

In `apps/server/src/user/dto/update-profile.dto.ts`, add the import and the new class:

```ts
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
```

```ts
export class UpdateNotificationSettingsDto {
  @IsBoolean()
  expenseRemindersEnabled: boolean;
}
```

- [ ] **Step 4: Implement the service changes**

In `apps/server/src/user/user.service.ts`, update the import line to include the new DTO:

```ts
import {
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdateNotificationSettingsDto,
} from './dto/update-profile.dto';
```

Replace `getProfile`:

```ts
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        expenseRemindersEnabled: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
```

Add a new method after `updatePassword`:

```ts
  async updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { expenseRemindersEnabled: dto.expenseRemindersEnabled },
      select: { id: true, email: true, name: true, avatar: true, expenseRemindersEnabled: true },
    });
  }
```

- [ ] **Step 5: Wire the controller route**

In `apps/server/src/user/user.controller.ts`, update the DTO import:

```ts
import {
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdateNotificationSettingsDto,
} from './dto/update-profile.dto';
```

Add a new route after `updatePassword`:

```ts
  @Put('notification-settings')
  updateNotificationSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.userService.updateNotificationSettings(userId, dto);
  }
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
npx jest user.service.spec.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 7: Verify the whole server still builds**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 8: Commit**

```bash
git add apps/server/src/user
git commit -m "$(cat <<'EOF'
feat: add PUT /user/notification-settings endpoint

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JVnJN5uHQhPZ7UTdFNEErS
EOF
)"
```

---

### Task 9: Profile-page notification toggle (frontend)

**Files:**
- Create: `apps/client/src/components/ui/switch.tsx`
- Modify: `apps/client/src/api/user.ts` (add `expenseRemindersEnabled` to `UserProfile`, add `updateNotificationSettings`)
- Modify: `apps/client/src/hooks/use-profile.ts` (add `useUpdateNotificationSettings`)
- Modify: `apps/client/src/pages/profile.tsx` (new "Уведомления" card)
- Modify: `apps/client/package.json` (add `@radix-ui/react-switch`)

**Interfaces:**
- Consumes: `PUT /user/notification-settings` (Task 8).

No unit test framework exists for the client in this repo — this task is verified via `tsc` build plus a manual check in the browser (Step 6).

- [ ] **Step 1: Install the Radix switch primitive**

```bash
cd apps/client && npm install @radix-ui/react-switch
```

- [ ] **Step 2: Add the shadcn `Switch` component**

Create `apps/client/src/components/ui/switch.tsx`:

```tsx
import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
```

(This mirrors the existing shadcn component style used by `apps/client/src/components/ui/select.tsx` in this repo — Radix primitive wrapped with `cn()` class merging.)

- [ ] **Step 3: Extend the API layer**

In `apps/client/src/api/user.ts`, add `expenseRemindersEnabled` to the interface and a new method:

```ts
export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar: string | null
  createdAt: string
  expenseRemindersEnabled: boolean
}
```

Add as a new property inside the `userApi` object, after `updatePassword`:

```ts
  updateNotificationSettings: (data: { expenseRemindersEnabled: boolean }) =>
    api.put<UserProfile>("/user/notification-settings", data).then((r) => r.data),
```

- [ ] **Step 4: Add the mutation hook**

In `apps/client/src/hooks/use-profile.ts`, add after `useUpdatePassword`:

```ts
export function useUpdateNotificationSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: userApi.updateNotificationSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] })
    },
  })
}
```

- [ ] **Step 5: Add the UI section**

In `apps/client/src/pages/profile.tsx`:

Add imports:

```tsx
import { useProfile, useUpdateEmail, useUpdatePassword, useUploadAvatar, useRemoveAvatar, useUpdateNotificationSettings } from "@/hooks/use-profile"
import { Switch } from "@/components/ui/switch"
```

Add the hook call inside `ProfilePage`, next to the other hooks:

```tsx
  const updateNotificationSettings = useUpdateNotificationSettings()
```

Insert a new card between the "Password" card and the `<Separator />` (i.e., right after the closing `</Card>` of the Password section, before `<Separator />`):

```tsx
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Уведомления</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Напоминать добавить расход</p>
              <p className="text-xs text-muted-foreground">
                Письмо, если по машине долго не было новых расходов. Письма о подтверждении почты отключить нельзя.
              </p>
            </div>
            <Switch
              checked={profile.expenseRemindersEnabled}
              disabled={updateNotificationSettings.isPending}
              onCheckedChange={(checked) =>
                updateNotificationSettings.mutate({ expenseRemindersEnabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
```

- [ ] **Step 6: Build and manually verify**

```bash
cd apps/client && npx tsc -b
```

Expected: exits 0, no type errors.

Then start the app and check the toggle in the browser (use the `run` skill or manually: `npm run dev:client` + `npm run dev:server` from repo root, log in, open `/profile`, confirm the switch renders, reflects `expenseRemindersEnabled`, and toggling it calls `PUT /api/user/notification-settings` (check the Network tab) and persists across a page reload.

- [ ] **Step 7: Commit**

```bash
git add apps/client/src/components/ui/switch.tsx apps/client/src/api/user.ts apps/client/src/hooks/use-profile.ts apps/client/src/pages/profile.tsx apps/client/package.json apps/client/package-lock.json
git commit -m "$(cat <<'EOF'
feat: add expense-reminder opt-out toggle to profile page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JVnJN5uHQhPZ7UTdFNEErS
EOF
)"
```

---

### Task 10: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full server test suite**

```bash
cd apps/server && npm test
```

Expected: all suites pass, including the 5 new `*.spec.ts` files added in Tasks 2, 3, 4/5, 6, 7, 8.

- [ ] **Step 2: Run the server build**

```bash
npm run build
```

Expected: exits 0.

- [ ] **Step 3: Run the client build**

```bash
cd ../client && npx tsc -b && npx vite build
```

Expected: exits 0.

- [ ] **Step 4: Confirm the migration is applied to the dev database**

```bash
cd /home/alex/apps/main/autonote && npx prisma migrate status --schema apps/server/prisma/schema.prisma
```

Expected: "Database schema is up to date!"

- [ ] **Step 5: Commit any remaining changes (e.g. lockfile updates), if present**

```bash
git status
```

If clean, no commit needed — this task is verification-only.
