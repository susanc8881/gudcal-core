import { redirect } from "next/navigation";
import { handleGoogleCallback } from "@/lib/calendar/google";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // personId, set in connect/route.ts
  const error = searchParams.get("error");

  if (error) {
    redirect("/dashboard/integrations?error=access_denied");
  }

  if (!code || !state) {
    redirect("/dashboard/integrations?error=missing_params");
  }

  const personId = Number(state);
  if (!Number.isInteger(personId)) {
    redirect("/dashboard/integrations?error=invalid_state");
  }

  let redirectUrl = "/dashboard/integrations?error=callback_failed";

  try {
    await handleGoogleCallback(code, personId);
    redirectUrl = "/dashboard/integrations?success=google_connected";
  } catch (err) {
    console.error("Google Calendar callback error:", err);
  }

  redirect(redirectUrl);
}
