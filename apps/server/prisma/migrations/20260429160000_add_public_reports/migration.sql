-- CreateTable
CREATE TABLE "public_reports" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicle_id" TEXT NOT NULL,

    CONSTRAINT "public_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "public_reports_token_key" ON "public_reports"("token");

-- AddForeignKey
ALTER TABLE "public_reports" ADD CONSTRAINT "public_reports_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
