import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantIconStyles: Record<
  NonNullable<StatCardProps["variant"]>,
  string
> = {
  default: "text-muted-foreground bg-muted/60",
  info: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  success: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  danger: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  description,
  variant = "default",
}: StatCardProps) {
  const isClickable = Boolean(href);

  const cardContent = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200",
              variantIconStyles[variant],
              isClickable && "group-hover:scale-105"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
          </div>
          {isClickable && (
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {value}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground truncate">
            {description}
          </span>
        )}
      </div>
    </>
  );

  if (isClickable && href) {
    return (
      <Link
        href={href}
        className={cn(
          "group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all duration-200",
          "hover:border-primary/50 hover:bg-muted/30 hover:shadow-md hover:-translate-y-0.5",
          "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        )}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs cursor-default"
      )}
    >
      {cardContent}
    </div>
  );
}
