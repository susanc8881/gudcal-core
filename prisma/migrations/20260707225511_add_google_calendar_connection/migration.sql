-- CreateTable
CREATE TABLE "GoogleCalendarConnection" (
    "connection_id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "calendar_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleCalendarConnection_pkey" PRIMARY KEY ("connection_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarConnection_person_id_key" ON "GoogleCalendarConnection"("person_id");

-- AddForeignKey
ALTER TABLE "GoogleCalendarConnection" ADD CONSTRAINT "GoogleCalendarConnection_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

