import { prisma } from "@/lib/db";

/** A session, scoped to a person who is actually an attendee on it. */
export async function getAuthorizedSession(sessionId: string, personId: number) {
  return prisma.session.findFirst({
    where: {
      session_id: Number(sessionId),
      SessionAttendants: { some: { person_id: personId } },
    },
  });
}
