"use client";

import { en } from "@/locales/en";
import { HiBars3 } from "react-icons/hi2";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserButton } from "./user-button";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface NavbarProps {
  user?: User;
  onOpenSidebar: () => void;
  showSidebarTrigger?: boolean;
}

export function Navbar({
  user,
  onOpenSidebar,
  showSidebarTrigger = true,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        {showSidebarTrigger && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSidebar}
            className="cursor-pointer"
            aria-label={en.dashboard.navbar.toggleSidebar}
          >
            <HiBars3 className="size-6" />
          </Button>
        )}
        <span className="font-semibold text-lg">
          {en.dashboard.navbar.brandName}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <UserButton user={user} />
      </div>
    </header>
  );
}
