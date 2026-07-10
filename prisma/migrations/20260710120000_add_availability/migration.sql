-- CreateTable
CREATE TABLE "Availability" (
    "availability_id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("availability_id")
);

-- CreateTable
CREATE TABLE "AvailabilityRule" (
    "availability_rule_id" SERIAL NOT NULL,
    "availability_id" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "AvailabilityRule_pkey" PRIMARY KEY ("availability_rule_id")
);

-- CreateTable
CREATE TABLE "DateOverride" (
    "date_override_id" SERIAL NOT NULL,
    "availability_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DateOverride_pkey" PRIMARY KEY ("date_override_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Availability_person_id_key" ON "Availability"("person_id");

-- CreateIndex
CREATE INDEX "AvailabilityRule_availability_id_idx" ON "AvailabilityRule"("availability_id");

-- CreateIndex
CREATE INDEX "DateOverride_availability_id_idx" ON "DateOverride"("availability_id");

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityRule" ADD CONSTRAINT "AvailabilityRule_availability_id_fkey" FOREIGN KEY ("availability_id") REFERENCES "Availability"("availability_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DateOverride" ADD CONSTRAINT "DateOverride_availability_id_fkey" FOREIGN KEY ("availability_id") REFERENCES "Availability"("availability_id") ON DELETE CASCADE ON UPDATE CASCADE;
