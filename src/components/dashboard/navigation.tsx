"use client";

import Link from "next/link";
import { en } from "@/locales/en";
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
import { Separator } from "@/components/ui/separator";
import { ProjectSwitcher } from "@/features/project/components/project-switcher";

interface NavigationProps {
  onNavigate?: () => void;
}

export const Navigation = ({ onNavigate }: NavigationProps) => {
  const pathname = usePathname();
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;
  const projectSlug = params?.projectSlug as string | undefined;

  const routes = [
    {
      label: en.dashboard.navigation.home,
      href: workspaceSlug ? `/dashboard/${workspaceSlug}` : "/dashboard",
      icon: GoHome,
      activeIcon: GoHomeFill,
    },
    {
      label: en.dashboard.navigation.myTasks,
      href: workspaceSlug
        ? `/dashboard/${workspaceSlug}/tasks`
        : "/dashboard/tasks",
      icon: GoCheckCircle,
      activeIcon: GoCheckCircleFill,
    },
    {
      label: en.dashboard.navigation.settings,
      href: workspaceSlug
        ? `/dashboard/${workspaceSlug}/settings`
        : "/dashboard/settings",
      icon: GoGear,
      activeIcon: GoGear,
    },
    {
      label: en.dashboard.navigation.members,
      href: workspaceSlug
        ? `/dashboard/${workspaceSlug}/members`
        : "/dashboard/members",
      icon: GoPeople,
      activeIcon: GoPeople,
    },
  ];

  const projectRoutes =
    projectSlug && workspaceSlug
      ? [
          {
            label: "Project Tasks",
            href: `/dashboard/${workspaceSlug}/projects/${projectSlug}/tasks`,
            icon: GoCheckCircle,
            activeIcon: GoCheckCircleFill,
          },
          {
            label: "Project Settings",
            href: `/dashboard/${workspaceSlug}/projects/${projectSlug}/settings`,
            icon: GoGear,
            activeIcon: GoGear,
          },
        ]
      : [];

  return (
    <div className="flex flex-col gap-y-4">
      <ul className="flex flex-col gap-y-1">
        {routes.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== `/dashboard/${workspaceSlug}` &&
              pathname.startsWith(item.href) &&
              !pathname.includes("/projects/")); // Avoid matching project sub-routes to workspace home

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
                    "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-muted-foreground",
                    isActive &&
                      "bg-background shadow-xs hover:opacity-100 text-primary"
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {workspaceSlug && (
        <div className="flex flex-col gap-y-4">
          <Separator className="my-1" />
          <div className="px-2.5">
            <ProjectSwitcher />
          </div>

          {projectRoutes.length > 0 && (
            <div className="border-l border-border ml-5 pl-3 flex flex-col gap-y-1">
              <ul className="flex flex-col gap-y-1">
                {projectRoutes.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !==
                      `/dashboard/${workspaceSlug}/projects/${projectSlug}` &&
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
                            "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-muted-foreground",
                            isActive &&
                              "bg-background shadow-xs hover:opacity-100 text-primary"
                          )}
                        >
                          <Icon className="size-5" />
                          {item.label}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
