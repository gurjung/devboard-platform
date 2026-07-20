"use client";

import { signOut } from "next-auth/react";
import { HiBars3, HiArrowRightOnRectangle } from "react-icons/hi2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface NavbarProps {
  user?: User;
  onOpenSidebar: () => void;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (email?.trim()) {
    return email.trim()[0].toUpperCase();
  }
  return "U";
}

export function Navbar({ user, onOpenSidebar }: NavbarProps) {
  const initials = getInitials(user?.name, user?.email);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          className="lg:hidden"
          aria-label="Open sidebar"
        >
          <HiBars3 className="size-6" />
        </Button>
        <span className="font-semibold text-lg lg:hidden">DevBoard</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="relative size-9 rounded-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Avatar className="size-9 cursor-pointer">
              {user?.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
              <AvatarFallback className="font-medium cursor-pointer">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-4">
            <div className="flex flex-col items-center justify-center text-center">
              <Avatar className="size-14 mb-2">
                {user?.image && <AvatarImage src={user.image} alt={user.name || "User"} />}
                <AvatarFallback className="text-base font-semibold">{initials}</AvatarFallback>
              </Avatar>
              {user?.name && (
                <p className="text-sm font-semibold leading-tight">{user.name}</p>
              )}
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate max-w-full mt-0.5">{user.email}</p>
              )}
            </div>
            <DropdownMenuSeparator className="my-3" />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="cursor-pointer justify-center text-center w-full"
            >
              <HiArrowRightOnRectangle className="size-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
