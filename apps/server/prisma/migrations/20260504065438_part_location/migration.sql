-- DropIndex
DROP INDEX "categories_name_key";

-- DropIndex
DROP INDEX "categories_slug_key";

-- AlterTable
ALTER TABLE "parts" ADD COLUMN     "location" TEXT;
