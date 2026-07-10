import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import { getCurrentPersonId } from "@/lib/auth/current-person";
import { getAuthorizedSession } from "@/lib/sessions";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export const metadata = constructMetadata({
  title: "Reschedule Session – GudCal",
});

interface RescheduleSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function RescheduleSessionPage({
  params,
}: RescheduleSessionPageProps) {
  const { sessionId } = await params;
  const personId = await getCurrentPersonId();
  if (!personId) redirect("/");

  const session = await getAuthorizedSession(sessionId, personId);
  if (!session) notFound();

  return (
    <>
      <DashboardHeader
        heading="Reschedule Session"
        text={format(session.session_date, "EEEE, MMM d 'at' h:mm a")}
      />

      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="calendarClock" />
        <EmptyPlaceholder.Title>
          Reschedule flow coming soon
        </EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          This will let you pick a new time within the other party&apos;s
          availability. For a student, it&apos;s only a request until admin
          approves it. For an advisor/tutor, it happens automatically and the
          student is offered to wait or take the slot with someone else.
        </EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    </>
  );
}
