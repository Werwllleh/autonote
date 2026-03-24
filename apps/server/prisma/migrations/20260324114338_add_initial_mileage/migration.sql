-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "initial_mileage" INTEGER NOT NULL DEFAULT 0;

-- Backfill: set initial_mileage = mileage for existing vehicles
UPDATE "vehicles" SET "initial_mileage" = "mileage";
