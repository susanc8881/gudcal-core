import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import { getCurrentPersonId } from "@/lib/auth/current-person";
import { getAuthorizedSession } from "@/lib/sessions";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({ title: "Edit Session – GudCal" });

interface EditSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function EditSessionPage({
  params,
}: EditSessionPageProps) {
  const { sessionId } = await params;
  const personId = await getCurrentPersonId();
  if (!personId) redirect("/");

  const session = await getAuthorizedSession(sessionId, personId);
  if (!session) notFound();

  return (
    <>
      <DashboardHeader
        heading="Edit Session"
        text={format(session.session_date, "EEEE, MMM d 'at' h:mm a")}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reschedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href={`/sessions/${session.session_id}/edit/reschedule`}>
                Choose a new time
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mark Late</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href={`/sessions/${session.session_id}/edit/late`}>
                I&apos;ll be late
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cancel</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="destructive" size="sm">
              <Link href={`/sessions/${session.session_id}/edit/cancel`}>
                Cancel session
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
