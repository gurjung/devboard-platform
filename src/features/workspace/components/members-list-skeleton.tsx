import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MembersListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card
          key={i}
          className="rounded-2xl border border-border/80 shadow-sm bg-card"
        >
          <CardContent className="p-5 flex flex-col gap-4 justify-between h-full">
            {/* Header row skeleton */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-2.5 w-36 rounded-md" />
                </div>
              </div>
            </div>

            {/* Bottom row skeleton */}
            <div className="flex items-center justify-between border-t border-border/50 pt-3 gap-4">
              <Skeleton className="h-3 w-8 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
