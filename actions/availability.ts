"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentPersonId } from "@/lib/auth/current-person";
import {
  updateAvailabilitySchema,
  type UpdateAvailabilityFormData,
} from "@/lib/validations/availability";

export async function updateAvailability(data: UpdateAvailabilityFormData) {
  try {
    const personId = await getCurrentPersonId();
    if (!personId) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    const validated = updateAvailabilitySchema.parse(data);

    await prisma.$transaction(async (tx) => {
      const availability = await tx.availability.upsert({
        where: { person_id: personId },
        create: { person_id: personId, timezone: validated.timezone },
        update: { timezone: validated.timezone },
      });

      // Replace all rules: delete existing, create new
      await tx.availabilityRule.deleteMany({
        where: { availability_id: availability.availability_id },
      });

      if (validated.rules.length > 0) {
        await tx.availabilityRule.createMany({
          data: validated.rules.map((rule) => ({
            availability_id: availability.availability_id,
            day_of_week: rule.dayOfWeek,
            start_time: rule.startTime,
            end_time: rule.endTime,
          })),
        });
      }

      if (validated.dateOverrides) {
        await tx.dateOverride.deleteMany({
          where: { availability_id: availability.availability_id },
        });

        if (validated.dateOverrides.length > 0) {
          await tx.dateOverride.createMany({
            data: validated.dateOverrides.map((override) => ({
              availability_id: availability.availability_id,
              date: new Date(override.date),
              start_time: override.startTime ?? null,
              end_time: override.endTime ?? null,
              is_blocked: override.isBlocked,
            })),
          });
        }
      }
    });

    revalidatePath("/dashboard/settings/availability");

    return { status: "success" as const };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error" as const, message: error.message };
    }
    return { status: "error" as const, message: "Something went wrong" };
  }
}
