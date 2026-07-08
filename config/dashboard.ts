import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "SETTINGS",
    items: [
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
