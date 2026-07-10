import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import { getCurrentPersonId } from "@/lib/auth/current-person";
import { getAuthorizedSession } from "@/lib/sessions";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export const metadata = constructMetadata({
  title: "Cancel Session – GudCal",
});

interface CancelSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function CancelSessionPage({
  params,
}: CancelSessionPageProps) {
  const { sessionId } = await params;
  const personId = await getCurrentPersonId();
  if (!personId) redirect("/");

  const session = await getAuthorizedSession(sessionId, personId);
  if (!session) notFound();

  return (
    <>
      <DashboardHeader
        heading="Cancel Session"
        text={format(session.session_date, "EEEE, MMM d 'at' h:mm a")}
      />

      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="close" />
        <EmptyPlaceholder.Title>
          Cancellation flow coming soon
        </EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          Per the attendance policy, cancelling here will ask for a reason
          (Sick, Time Conflict, etc.). For a student, this is only a request
          until admin approves it, after which the advisor/tutor is
          notified. For an advisor/tutor, it happens automatically and the
          student is notified with rescheduling options.
        </EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    </>
  );
}
