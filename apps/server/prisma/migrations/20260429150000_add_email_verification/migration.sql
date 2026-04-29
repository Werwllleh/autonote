-- AlterTable
ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "verify_token" TEXT;

-- Mark existing users as verified
UPDATE "users" SET "email_verified" = true;

-- CreateIndex
CREATE UNIQUE INDEX "users_verify_token_key" ON "users"("verify_token");
