-- AlterTable: Session no longer holds Google Meet details directly --
-- GoogleMeetSpace (infrastructure logic) now owns the API URI and meeting
-- code, joined to Session (core business logic) via session_id.
ALTER TABLE "Session"
  DROP COLUMN "meeting_url",
  DROP COLUMN "meeting_password";
