import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import { prisma } from "@/lib/db";
import { getCurrentPersonId } from "@/lib/auth/current-person";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export const metadata = constructMetadata({
  title: "Upcoming Sessions – GudCal",
  description: "Your upcoming ClearPillar sessions.",
});

export default async function UpcomingSessionsPage() {
  const personId = await getCurrentPersonId();
  if (!personId) redirect("/");

  const sessions = await prisma.session.findMany({
    where: {
      session_date: { gte: new Date() },
      SessionAttendants: { some: { person_id: personId } },
    },
    orderBy: { session_date: "asc" },
  });

  return (
    <>
      <DashboardHeader
        heading="Upcoming Sessions"
        text="Cancel, reschedule, or mark yourself late from here."
      />

      {sessions.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="calendarClock" />
          <EmptyPlaceholder.Title>No upcoming sessions</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Once a session is booked, it will show up here.
          </EmptyPlaceholder.Description>
        </EmptyPlaceholder>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card key={session.session_id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {format(session.session_date, "EEEE, MMM d 'at' h:mm a")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground text-sm">
                  {session.session_description ?? "Regular session"}
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/sessions/${session.session_id}/edit/reschedule`}
                    >
                      Reschedule
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/sessions/${session.session_id}/edit/late`}>
                      Mark Late
                    </Link>
                  </Button>
                  <Button asChild variant="destructive" size="sm">
                    <Link
                      href={`/sessions/${session.session_id}/edit/cancel`}
                    >
                      Cancel
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
