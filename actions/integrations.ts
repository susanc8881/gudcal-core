"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { getCurrentPersonId } from "@/lib/auth/current-person";

export async function disconnectCalendar() {
  try {
    const personId = await getCurrentPersonId();
    if (!personId) {
      return { status: "error" as const, message: "Not authenticated" };
    }

    await prisma.googleCalendarConnection.deleteMany({
      where: { person_id: personId },
    });

    revalidatePath("/dashboard/integrations");

    return { status: "success" as const };
  } catch (error) {
    if (error instanceof Error) {
      return { status: "error" as const, message: error.message };
    }
    return { status: "error" as const, message: "Something went wrong" };
  }
}
