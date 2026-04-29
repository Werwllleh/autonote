-- AlterTable: add user_id and is_system columns to categories
ALTER TABLE "categories" ADD COLUMN "user_id" TEXT;
ALTER TABLE "categories" ADD COLUMN "is_system" BOOLEAN NOT NULL DEFAULT false;

-- Mark existing categories as system
UPDATE "categories" SET "is_system" = true;

-- Drop old unique constraints
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_key";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_key";

-- CreateIndex: unique constraint on [slug, user_id]
CREATE UNIQUE INDEX "categories_slug_user_id_key" ON "categories"("slug", "user_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
