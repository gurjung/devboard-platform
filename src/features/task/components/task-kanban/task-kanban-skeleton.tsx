"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SKELETON_COLUMNS = [
  {
    id: "BACKLOG",
    label: "Backlog",
    bgClass: "bg-zinc-50 dark:bg-zinc-950/20",
    borderClass: "border-zinc-200/50 dark:border-zinc-800/40",
  },
  {
    id: "TODO",
    label: "Todo",
    bgClass: "bg-blue-50/30 dark:bg-blue-950/10",
    borderClass: "border-blue-150/40 dark:border-blue-900/30",
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    bgClass: "bg-amber-50/30 dark:bg-amber-950/10",
    borderClass: "border-amber-150/40 dark:border-amber-900/30",
  },
  {
    id: "IN_REVIEW",
    label: "In Review",
    bgClass: "bg-purple-50/30 dark:bg-purple-950/10",
    borderClass: "border-purple-150/40 dark:border-purple-900/30",
  },
  {
    id: "DONE",
    label: "Done",
    bgClass: "bg-emerald-50/30 dark:bg-emerald-950/10",
    borderClass: "border-emerald-150/40 dark:border-emerald-900/30",
  },
];

export function TaskKanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {SKELETON_COLUMNS.map((col) => (
        <div
          key={col.id}
          className={cn(
            "flex flex-col gap-4 p-4 rounded-2xl border min-h-[550px]",
            col.bgClass,
            col.borderClass
          )}
        >
          {/* Skeleton Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4.5 w-6 rounded-full" />
            </div>
          </div>

          {/* Skeleton Cards */}
          <div className="flex flex-col gap-3 flex-1">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 p-4 rounded-xl border border-border/60 bg-card"
              >
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-[75%] rounded-md" />
                  <Skeleton className="h-3 w-[45%] rounded-md" />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-3.5 w-14 rounded-md" />
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-2.5 mt-0.5">
                  <Skeleton className="h-3.5 w-14 rounded-md" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-5.5 w-5.5 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
