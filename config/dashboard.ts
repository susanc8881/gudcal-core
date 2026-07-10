import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      {
        href: "/dashboard",
        icon: "home",
        title: "Home",
      },
      {
        href: "/dashboard/sessions",
        icon: "calendarClock",
        title: "Upcoming Sessions",
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        href: "/dashboard/settings/availability",
        icon: "clock",
        title: "Availability",
      },
      {
        href: "/dashboard/integrations",
        icon: "link",
        title: "Integrations",
      },
      {
        href: "/dashboard/charts",
        icon: "lineChart",
        title: "Charts",
      },
    ],
  },
];
