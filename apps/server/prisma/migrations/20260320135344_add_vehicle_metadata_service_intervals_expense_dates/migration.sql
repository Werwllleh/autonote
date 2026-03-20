-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "date_from" TIMESTAMP(3),
ADD COLUMN     "date_to" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "license_plate" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purchase_date" TIMESTAMP(3),
ADD COLUMN     "purchase_price" DOUBLE PRECISION,
ADD COLUMN     "registration_number" TEXT,
ADD COLUMN     "vin" TEXT;

-- CreateTable
CREATE TABLE "service_intervals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "interval_km" INTEGER,
    "interval_months" INTEGER,
    "last_service_date" TIMESTAMP(3),
    "last_service_mileage" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vehicle_id" TEXT NOT NULL,

    CONSTRAINT "service_intervals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_intervals" ADD CONSTRAINT "service_intervals_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
