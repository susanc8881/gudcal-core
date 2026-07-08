import { redirect } from "next/navigation";
import { getGoogleAuthUrl } from "@/lib/calendar/google";
import { getCurrentPersonId } from "@/lib/auth/current-person";

export async function GET() {
  const personId = await getCurrentPersonId();

  if (!personId) {
    redirect("/login");
  }

  const authUrl = getGoogleAuthUrl(personId);
  redirect(authUrl);
}
