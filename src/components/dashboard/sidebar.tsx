"use client";

import Link from "next/link";
import { HiXMark } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { en } from "@/locales/en";
import { Separator } from "@/components/ui/separator";
import { WorkspaceSwitcher } from "@/features/workspace/components/settings/workspace-switcher";
import { Navigation } from "./navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-neutral-100 dark:bg-zinc-900 transition-all duration-200 ease-in-out lg:static lg:z-auto border-r border-neutral-200 dark:border-zinc-800",
          open
            ? "w-64 p-4 translate-x-0"
            : "-translate-x-full w-64 p-4 lg:translate-x-0 lg:w-0 lg:p-0 lg:overflow-hidden lg:border-r-0"
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-xl tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            <span>{en.dashboard.sidebar.brandName}</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-zinc-800 lg:hidden"
            aria-label={en.dashboard.sidebar.closeSidebar}
          >
            <HiXMark className="size-6" />
          </button>
        </div>

        <Separator className="my-4" />

        <div className="mb-4">
          <WorkspaceSwitcher />
        </div>

        <Navigation onNavigate={onClose} />
      </aside>
    </>
  );
}
