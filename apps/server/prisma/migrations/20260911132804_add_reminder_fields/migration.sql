-- AlterTable
ALTER TABLE "users" ADD COLUMN     "expense_reminder_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expense_reminders_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_expense_reminder_at" TIMESTAMP(3),
ADD COLUMN     "last_login_at" TIMESTAMP(3),
ADD COLUMN     "last_verification_reminder_at" TIMESTAMP(3),
ADD COLUMN     "verification_reminder_count" INTEGER NOT NULL DEFAULT 0;
