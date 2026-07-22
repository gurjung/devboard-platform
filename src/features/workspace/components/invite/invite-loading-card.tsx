"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InviteLoadingCard() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 p-4">
      <Card className="w-full max-w-md border-border/80 shadow-lg p-4 rounded-3xl">
        <CardHeader className="flex flex-col items-center justify-center text-center pb-4 space-y-3">
          {/* Icon Skeleton */}
          <Skeleton className="h-10 w-10 rounded-full" />
          
          {/* Title Skeleton */}
          <Skeleton className="h-6 w-32 rounded-lg" />
          
          {/* Description Skeletons */}
          <div className="space-y-1.5 flex flex-col items-center w-full">
            <Skeleton className="h-3 w-5/6 rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-2">
          {/* Invited Email Block Skeleton */}
          <Skeleton className="h-14 w-full rounded-xl" />

          {/* Button Skeletons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Skeleton className="flex-1 h-10 rounded-xl" />
            <Skeleton className="flex-1 h-10 rounded-xl" />
          </div>
        </CardContent>
        
        <CardFooter className="justify-center pt-2">
          {/* Footer Text Skeleton */}
          <Skeleton className="h-3 w-3/4 rounded" />
        </CardFooter>
      </Card>
    </div>
  );
}
