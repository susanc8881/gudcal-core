import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentPersonId } from "@/lib/auth/current-person";
import { constructMetadata } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "Account Settings – GudCal",
  description: "Manage your ClearPillar account settings.",
});

export default async function SettingsPage() {
  const personId = await getCurrentPersonId();
  if (!personId) redirect("/");

  return (
    <>
      <DashboardHeader
        heading="Account Settings"
        text="Manage your account preferences."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Availability</CardTitle>
            <CardDescription>
              Set the days and times you&apos;re available for sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/settings/availability">
                Edit Availability
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
