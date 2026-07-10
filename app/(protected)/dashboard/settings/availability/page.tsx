import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getCurrentPersonId } from "@/lib/auth/current-person";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { WeeklyScheduleEditor } from "@/components/availability/weekly-schedule-editor";

export const metadata = constructMetadata({
  title: "Availability – GudCal",
  description: "Set your weekly availability for sessions.",
});

export default async function AvailabilityPage() {
  const personId = await getCurrentPersonId();
  if (!personId) redirect("/");

  // Only students, advisors, and tutors set availability -- admins have no
  // sessions to be available for.
  const person = await prisma.person.findUnique({
    where: { person_id: personId },
    select: {
      Student: { select: { student_id: true } },
      Advisor: { select: { advisor_id: true } },
      Tutor: { select: { tutor_id: true } },
    },
  });
  const canEditAvailability = Boolean(
    person?.Student || person?.Advisor || person?.Tutor,
  );
  if (!canEditAvailability) redirect("/dashboard/settings");

  const availability = await prisma.availability.findUnique({
    where: { person_id: personId },
    include: {
      AvailabilityRule: {
        orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
      },
      DateOverride: {
        orderBy: { date: "asc" },
      },
    },
  });

  return (
    <>
      <DashboardHeader
        heading="Availability"
        text="Set the days and times you're available for sessions."
      />

      <WeeklyScheduleEditor
        defaultValues={{
          timezone: availability?.timezone ?? "America/New_York",
          rules: (availability?.AvailabilityRule ?? []).map((rule) => ({
            dayOfWeek: rule.day_of_week,
            startTime: rule.start_time,
            endTime: rule.end_time,
          })),
          dateOverrides: (availability?.DateOverride ?? []).map(
            (override) => ({
              date: override.date.toISOString().split("T")[0],
              startTime: override.start_time,
              endTime: override.end_time,
              isBlocked: override.is_blocked,
            }),
          ),
        }}
      />
    </>
  );
}
