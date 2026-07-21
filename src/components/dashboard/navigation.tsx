"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  GoHome,
  GoHomeFill,
  GoCheckCircle,
  GoCheckCircleFill,
  GoGear,
  GoPeople,
} from "react-icons/go";
import { cn } from "@/lib/utils";

interface NavigationProps {
  onNavigate?: () => void;
}

export const Navigation = ({ onNavigate }: NavigationProps) => {
  const pathname = usePathname();
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;

  const routes = [
    {
      label: "Home",
      href: workspaceSlug ? `/dashboard/${workspaceSlug}` : "/dashboard",
      icon: GoHome,
      activeIcon: GoHomeFill,
    },
    {
      label: "My Tasks",
      href: workspaceSlug ? `/dashboard/${workspaceSlug}/tasks` : "/dashboard/tasks",
      icon: GoCheckCircle,
      activeIcon: GoCheckCircleFill,
    },
    {
      label: "Settings",
      href: workspaceSlug ? `/dashboard/${workspaceSlug}/settings` : "/dashboard/settings",
      icon: GoGear,
      activeIcon: GoGear,
    },
    {
      label: "Members",
      href: workspaceSlug ? `/dashboard/${workspaceSlug}/members` : "/dashboard/members",
      icon: GoPeople,
      activeIcon: GoPeople,
    },
  ];

  return (
    <ul className="flex flex-col gap-y-1">
      {routes.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            item.href !== `/dashboard/${workspaceSlug}` &&
            pathname.startsWith(item.href));
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={(e) => {
                if (isActive) {
                  e.preventDefault();
                }
                onNavigate?.();
              }}
            >
              <div
                className={cn(
                  "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                  isActive && "bg-white shadow-sm hover:opacity-100 text-primary dark:bg-zinc-800 dark:text-zinc-50"
                )}
              >
                <Icon className="size-5 text-neutral-500" />
                {item.label}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
