import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function WorkspaceSettingsLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto py-4 animate-pulse">
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>

      <Card className="w-full rounded-2xl border border-border/80 shadow-md bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <div className="flex justify-end pt-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full rounded-2xl border border-border/60 shadow-md bg-card">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-4 w-24 rounded-md mx-auto" />
          <Skeleton className="h-3 w-64 rounded-md mx-auto" />
          <Skeleton className="h-9 w-32 rounded-xl mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
}
