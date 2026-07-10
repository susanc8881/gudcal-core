import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";

import { getCurrentPersonId } from "@/lib/auth/current-person";
import { getAuthorizedSession } from "@/lib/sessions";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";

export const metadata = constructMetadata({ title: "Mark Late – GudCal" });

interface MarkLatePageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function MarkLatePage({ params }: MarkLatePageProps) {
  const { sessionId } = await params;
  const personId = await getCurrentPersonId();
  if (!personId) redirect("/");

  const session = await getAuthorizedSession(sessionId, personId);
  if (!session) notFound();

  return (
    <>
      <DashboardHeader
        heading="Mark Late"
        text={format(session.session_date, "EEEE, MMM d 'at' h:mm a")}
      />

      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="clock" />
        <EmptyPlaceholder.Title>
          Lateness flow coming soon
        </EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          This will let you flag anticipated lateness in increments (5, 10,
          … 30 min), per the attendance policy.
        </EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    </>
  );
}
