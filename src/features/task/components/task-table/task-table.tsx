"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { TaskWithAssignee } from "../../hooks/use-tasks";
import { TaskTableSkeleton } from "./task-table-skeleton";
import { TaskTableEmpty } from "./task-table-empty";
import { TaskTableRow } from "./task-table-row";
import { cn } from "@/lib/utils";

interface TaskTableProps {
  tasks: TaskWithAssignee[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRowClick: (task: TaskWithAssignee) => void;
  onDeleteClick: (task: TaskWithAssignee) => void;
  isFiltered: boolean;
  onCreateClick?: () => void;
  currentUserId: string;
  currentUserRole: string;
  hasMultiplePages: boolean;
  totalTasksCount: number;
  showProjectColumn?: boolean;
  workspaceSlug?: string;
}

export function TaskTable({
  tasks,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRowClick,
  onDeleteClick,
  isFiltered,
  onCreateClick,
  currentUserId,
  currentUserRole,
  hasMultiplePages,
  totalTasksCount,
  showProjectColumn = false,
  workspaceSlug,
}: TaskTableProps) {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      onLoadMore();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return <TaskTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center border border-destructive/20 rounded-2xl p-12 text-center bg-destructive/5">
        <p className="text-sm font-medium text-destructive">
          Failed to load tasks
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Please check your network or try refreshing the page.
        </p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <TaskTableEmpty
        isFiltered={isFiltered}
        onCreateClick={onCreateClick}
        emptyMessage={
          showProjectColumn ? "No tasks assigned to you" : undefined
        }
        emptyDescription={
          showProjectColumn
            ? "You currently have no tasks assigned to you in this workspace."
            : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border/60 overflow-hidden bg-background animate-in fade-in duration-200 [&_[data-slot=table-container]]:max-h-[540px] [&_[data-slot=table-container]]:overflow-y-auto">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-muted/85 backdrop-blur-sm sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]">
            <TableRow>
              <TableHead
                className={cn(
                  "text-xs font-semibold",
                  showProjectColumn ? "w-[28%]" : "w-[40%]"
                )}
              >
                Title
              </TableHead>
              {showProjectColumn && (
                <TableHead className="w-[15%] text-xs font-semibold">
                  Project
                </TableHead>
              )}
              <TableHead
                className={cn(
                  "text-xs font-semibold",
                  showProjectColumn ? "w-[14%]" : "w-[15%]"
                )}
              >
                Status
              </TableHead>
              <TableHead
                className={cn(
                  "text-xs font-semibold",
                  showProjectColumn ? "w-[14%]" : "w-[15%]"
                )}
              >
                Priority
              </TableHead>
              <TableHead className="w-[15%] text-xs font-semibold">
                Assignee
              </TableHead>
              <TableHead
                className={cn(
                  "text-xs font-semibold text-right",
                  showProjectColumn ? "w-[14%]" : "w-[10%]"
                )}
              >
                Due Date
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TaskTableRow
                key={task.id}
                task={task}
                onRowClick={onRowClick}
                onDeleteClick={onDeleteClick}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                showProjectColumn={showProjectColumn}
                workspaceSlug={workspaceSlug}
              />
            ))}
            {/* Sentinel element at the bottom of the table for infinite scroll */}
            <TableRow className="hover:bg-transparent border-0 h-1">
              <TableCell
                colSpan={showProjectColumn ? 7 : 6}
                className="p-0 h-1"
              >
                <div
                  ref={hasNextPage && !isFetchingNextPage ? ref : undefined}
                  className="h-px"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Count feedback, loading state & footer message */}
      {tasks.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 text-xs text-muted-foreground/90 font-medium">
          <div>
            Showing {tasks.length} of {totalTasksCount} tasks
          </div>
          <div className="flex items-center gap-1.5 min-h-[16px]">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-1.5 text-primary/80 animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading more tasks...</span>
              </div>
            ) : !hasNextPage && hasMultiplePages ? (
              <span className="text-muted-foreground/60">
                You've reached the end
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
