-- CreateTable
CREATE TABLE "tire_sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "size" TEXT,
    "production_year" INTEGER,
    "tread_depth" DOUBLE PRECISION,
    "is_mounted" BOOLEAN NOT NULL DEFAULT false,
    "storage_location" TEXT,
    "installed_mileage" INTEGER,
    "installed_date" TIMESTAMP(3),
    "total_mileage" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vehicle_id" TEXT NOT NULL,

    CONSTRAINT "tire_sets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tire_sets" ADD CONSTRAINT "tire_sets_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
