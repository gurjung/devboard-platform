"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="size-9 flex items-center justify-center cursor-pointer rounded-full outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Toggle theme"
      >
        {!mounted ? (
          <div className="size-4" />
        ) : resolvedTheme === "dark" ? (
          <Moon className="size-4 text-foreground" />
        ) : (
          <Sun className="size-4 text-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="p-1 rounded-xl shadow-md border border-border/85 min-w-[140px]"
      >
        <DropdownMenuItem
          className={cn(
            "cursor-pointer text-xs flex items-center justify-between w-full",
            mounted &&
              theme === "light" &&
              "font-semibold bg-accent/40 text-foreground"
          )}
          onClick={() => setTheme("light")}
        >
          <span>Light</span>
          {mounted && theme === "light" && (
            <Check className="size-3.5 text-primary ml-2" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "cursor-pointer text-xs flex items-center justify-between w-full",
            mounted &&
              theme === "dark" &&
              "font-semibold bg-accent/40 text-foreground"
          )}
          onClick={() => setTheme("dark")}
        >
          <span>Dark</span>
          {mounted && theme === "dark" && (
            <Check className="size-3.5 text-primary ml-2" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "cursor-pointer text-xs flex items-center justify-between w-full",
            mounted &&
              theme === "system" &&
              "font-semibold bg-accent/40 text-foreground"
          )}
          onClick={() => setTheme("system")}
        >
          <span>System</span>
          {mounted && theme === "system" && (
            <Check className="size-3.5 text-primary ml-2" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
