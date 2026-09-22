"use client";

import { Button } from "@/components/ui/button";

interface TaskTableEmptyProps {
  isFiltered: boolean;
  onCreateClick?: () => void;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function TaskTableEmpty({
  isFiltered,
  onCreateClick,
  emptyMessage,
  emptyDescription,
}: TaskTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border/80 rounded-2xl p-16 text-center bg-muted/10">
      {isFiltered ? (
        <>
          <p className="text-sm font-medium text-muted-foreground">
            No tasks found
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            No tasks match your active filters. Try clearing your filters.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-muted-foreground">
            {emptyMessage || "No tasks in this project yet"}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1 mb-4">
            {emptyDescription ||
              (onCreateClick
                ? "Get started by creating your very first project task."
                : "You currently have no assigned tasks in this workspace.")}
          </p>
          {onCreateClick && (
            <Button
              onClick={onCreateClick}
              size="sm"
              className="h-9 px-4 text-xs rounded-xl cursor-pointer"
            >
              Create Task
            </Button>
          )}
        </>
      )}
    </div>
  );
}
