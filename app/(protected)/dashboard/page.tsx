import Link from "next/link";
import { redirect } from "next/navigation";

import { constructMetadata } from "@/lib/utils";
import { getCurrentPersonId } from "@/lib/auth/current-person";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/header";
import { Icons } from "@/components/shared/icons";

export const metadata = constructMetadata({
  title: "Home – GudCal",
  description: "Your ClearPillar scheduling overview.",
});

const shortcuts = [
  {
    href: "/dashboard/sessions",
    icon: "calendarClock",
    title: "Upcoming Sessions",
    description: "View, reschedule, cancel, or mark yourself late.",
  },
  {
    href: "/dashboard/settings/availability",
    icon: "clock",
    title: "Availability",
    description: "Set the times you're available for sessions.",
  },
  {
    href: "/dashboard/integrations",
    icon: "link",
    title: "Integrations",
    description: "Connect your Google Calendar.",
  },
] as const;

export default async function DashboardHomePage() {
  const personId = await getCurrentPersonId();
  if (!personId) redirect("/");

  return (
    <>
      <DashboardHeader
        heading="Home"
        text="Welcome back! Here's a quick jump-off point for your scheduling."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((shortcut) => {
          const Icon = Icons[shortcut.icon];
          return (
            <Card key={shortcut.href}>
              <CardHeader>
                <Icon className="text-muted-foreground mb-2 size-6" />
                <CardTitle className="text-base">{shortcut.title}</CardTitle>
                <CardDescription>{shortcut.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link href={shortcut.href}>Go to {shortcut.title}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
