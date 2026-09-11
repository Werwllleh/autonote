# Design: Automated Email Reminders

Date: 2026-09-11
Epic: autonote-150

## Purpose

Two automated, scheduled email reminders, sent without user action:

1. **Verify-email reminder** — nudges users who registered but never confirmed
   their email (verification already exists, but today only fires if the user
   manually clicks "resend").
2. **Add-expense nudge** — nudges users who have at least one vehicle but
   haven't logged an expense recently, to drive engagement.

Related but out of scope: admin panel visibility improvements are tracked
separately under autonote-rkf (bounded change, no spec needed).

## Constraints from stakeholder discussion

- Verify-email reminder is a **transactional/system message** — it must
  always be deliverable and is **not** subject to opt-out.
- Add-expense nudge is a **non-critical engagement email** — users must be
  able to opt out of it specifically, without affecting delivery of system
  messages (verification, password reset, etc.).
- Verify-email reminder: every 3 days, capped at 3 sends total.
- Add-expense nudge: after 14 days without new expense activity, capped at
  5 sends total (per inactivity period — see "Reset on activity" below).

## Data model changes

`apps/server/prisma/schema.prisma`, `User` model — new nullable/defaulted
fields (migration required):

```prisma
lastLoginAt                 DateTime?
lastVerificationReminderAt  DateTime?
verificationReminderCount   Int       @default(0)
lastExpenseReminderAt       DateTime?
expenseReminderCount        Int       @default(0)
expenseRemindersEnabled     Boolean   @default(true)
```

- `lastLoginAt` is set in `AuthService.login()` on every successful login.
  It also feeds the admin-panel visibility work (autonote-rkf) but is
  introduced here since the reminders feature is what requires it first.
- `verificationReminderCount` / `expenseReminderCount` are simple send
  counters used purely to cap the number of reminder emails.

### Reset on activity

- `expenseReminderCount` resets to 0 whenever the user adds a new expense
  (in the existing expense-creation service). This means the 5-send cap
  applies to a single inactivity streak, not to the user's lifetime — a
  user who becomes active again and then goes quiet later is eligible for
  reminders again.
- `verificationReminderCount` does not need a reset path: once
  `emailVerified` becomes true the user permanently drops out of the
  verification-reminder query.

## Components

### `RemindersModule` (new — `apps/server/src/reminders/`)

- `reminders.module.ts` — registers `RemindersService`, imports `PrismaModule`
  and `MailModule`.
- `reminders.service.ts` — two methods, each triggered by its own `@Cron`
  job (NestJS `@nestjs/schedule`, new dependency):
  - `sendVerificationReminders()` — daily at 10:00 server time.
  - `sendExpenseReminders()` — daily at 10:00 server time (can share one
    cron tick; kept as two methods for isolated testability).

`AppModule` gains `ScheduleModule.forRoot()` and imports `RemindersModule`.

### `MailService` additions (`apps/server/src/mail/mail.service.ts`)

- `sendVerificationReminder(to: string, token: string): Promise<void>` —
  same template style as the existing `sendVerification`, adjusted copy to
  indicate this is a reminder.
- `sendExpenseReminder(to: string): Promise<void>` — new template inviting
  the user to log a recent expense.

### User notification settings

- `PUT /user/notification-settings` in `apps/server/src/user/user.controller.ts`,
  body `UpdateNotificationSettingsDto { expenseRemindersEnabled: boolean }`,
  handled by a new method on `apps/server/src/user/user.service.ts`.
- Frontend: `apps/client/src/pages/profile.tsx` gains a "Уведомления"
  section with a toggle, wired through `apps/client/src/api/user.ts` and
  `apps/client/src/hooks/use-profile.ts` following the existing mutation
  pattern used for email/password updates.

## Query logic

### Verification reminder candidates

```
User where
  emailVerified = false
  AND createdAt <= now - 3d
  AND verificationReminderCount < 3
  AND (lastVerificationReminderAt IS NULL OR lastVerificationReminderAt <= now - 3d)
```

For each: send mail, `verificationReminderCount += 1`,
`lastVerificationReminderAt = now`.

### Expense nudge candidates

```
User where
  emailVerified = true
  AND expenseRemindersEnabled = true
  AND has >= 1 vehicle
  AND expenseReminderCount < 5
  AND (lastExpenseReminderAt IS NULL OR lastExpenseReminderAt <= now - 14d)
  AND lastActivityDate <= now - 14d
```

where `lastActivityDate` = `max(latest expense.date across the user's
vehicles, vehicle.createdAt for vehicles with no expenses)`. Computed the
same way the admin panel computes "last activity" (autonote-rkf) — the two
features should share a helper rather than duplicate the aggregation
query; put it in a small shared utility (e.g.
`apps/server/src/common/user-activity.util.ts`) used by both
`AdminService` and `RemindersService`.

For each: send mail, `expenseReminderCount += 1`, `lastExpenseReminderAt = now`.

## Error handling

Each send is wrapped in its own `try/catch` inside the per-user loop, so
one failing delivery (bad SMTP response, invalid address) does not abort
the rest of the batch or roll back DB updates for other users. Failures
are logged via Nest's `Logger`; no in-run retry — a failed send is simply
retried on the next scheduled run for verification (the count/timestamp
are only updated on a successful send) — same for expense nudges.

## Testing (TDD)

Unit tests (mocked Prisma) for `RemindersService`:
- Verification: includes eligible user; excludes verified user; excludes
  user under the 3-day cooldown; excludes user at the 3-send cap.
- Expense nudge: includes user with stale activity; excludes user with
  recent expense; excludes user with `expenseRemindersEnabled = false`;
  excludes user with zero vehicles; includes user with a vehicle but zero
  expenses ever (activity = vehicle.createdAt); excludes user at the
  5-send cap.
- Send-success path updates counters/timestamps; send-failure path leaves
  them unchanged and doesn't throw out of the batch.

Unit tests for the two new `MailService` methods (transport called with
expected `to`/subject, no real network I/O — following the existing
`sendVerification` test pattern if present, otherwise mock nodemailer's
transport the same way).

Unit test for the expense-creation service confirming
`expenseReminderCount` resets to 0 on new expense creation.

## Out of scope

- Admin-panel display of these fields (tracked separately, autonote-rkf).
- Configurable cron schedule / thresholds via env vars — constants in code
  are sufficient for now (YAGNI); can be extracted later if needed.
- Any notification channel other than email (push, in-app) — not
  requested.
