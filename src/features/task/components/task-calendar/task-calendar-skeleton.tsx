"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskCalendarSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 flex flex-col gap-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-9 w-40 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        {/* Week Days Headers & Cells Skeleton with horizontal scroll wrapper */}
        <div className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="min-w-[768px] lg:min-w-0 flex flex-col gap-2">
            {/* Week Days Headers Skeleton */}
            <div className="grid grid-cols-7 gap-2 text-center pb-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-12 mx-auto rounded-md" />
              ))}
            </div>
            {/* Cells Skeleton */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="min-h-[140px] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="h-[600px] rounded-2xl" />
      </div>
    </div>
  );
}
