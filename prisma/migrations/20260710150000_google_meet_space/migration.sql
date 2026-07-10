-- CreateEnum
CREATE TYPE "FetchStatus" AS ENUM ('PENDING', 'FETCHING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "GoogleMeetSpace" (
    "google_meet_space_id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "meeting_uri" TEXT NOT NULL,
    "meeting_code" TEXT,

    CONSTRAINT "GoogleMeetSpace_pkey" PRIMARY KEY ("google_meet_space_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleMeetSpace_session_id_key" ON "GoogleMeetSpace"("session_id");

-- AddForeignKey
ALTER TABLE "GoogleMeetSpace" ADD CONSTRAINT "GoogleMeetSpace_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("session_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: MeetingTranscript now references GoogleMeetSpace instead of
-- GoogleMeetSpace holding the transcript directly, plus fetch tracking.
ALTER TABLE "MeetingTranscript"
  ADD COLUMN "google_meet_space_id" INTEGER NOT NULL,
  ADD COLUMN "fetch_status" "FetchStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "fetch_error" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MeetingTranscript_google_meet_space_id_key" ON "MeetingTranscript"("google_meet_space_id");

-- AddForeignKey
ALTER TABLE "MeetingTranscript" ADD CONSTRAINT "MeetingTranscript_google_meet_space_id_fkey" FOREIGN KEY ("google_meet_space_id") REFERENCES "GoogleMeetSpace"("google_meet_space_id") ON DELETE RESTRICT ON UPDATE CASCADE;
