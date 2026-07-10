import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

// Public read endpoint: returns a person's raw weekly availability by
// username. Consumed by the main ClearPillar site's "new pair" page so
// admin can compare a student's and an advisor/tutor's availability when
// matching them -- see the Calendar Team deliverable sheet. ClearPillar
// sessions are a fixed weekly time set by admin (not self-serve slot
// booking), so this intentionally returns raw rules/overrides rather than
// computed bookable slots.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const person = await prisma.person.findUnique({
    where: { username },
    select: {
      Availability: {
        include: {
          AvailabilityRule: true,
          DateOverride: true,
        },
      },
    },
  });

  if (!person?.Availability) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { timezone, AvailabilityRule, DateOverride } = person.Availability;

  return NextResponse.json({
    timezone,
    rules: AvailabilityRule.map((rule) => ({
      dayOfWeek: rule.day_of_week,
      startTime: rule.start_time,
      endTime: rule.end_time,
    })),
    dateOverrides: DateOverride.map((override) => ({
      date: override.date.toISOString().split("T")[0],
      startTime: override.start_time,
      endTime: override.end_time,
      isBlocked: override.is_blocked,
    })),
  });
}
