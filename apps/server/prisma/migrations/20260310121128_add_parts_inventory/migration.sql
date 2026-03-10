-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "article" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vehicle_id" TEXT NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
