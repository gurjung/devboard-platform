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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Loader2, Calendar, MoreVertical, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskWithAssignee } from "../hooks/use-tasks";
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
  onCreateClick: () => void;
  currentUserId: string;
  currentUserRole: string;
  hasMultiplePages: boolean;
  totalTasksCount: number;
}

const statusStyles: Record<string, { label: string; className: string }> = {
  BACKLOG: {
    label: "Backlog",
    className: "bg-muted text-muted-foreground hover:bg-muted",
  },
  TODO: {
    label: "Todo",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/15",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/15",
  },
  IN_REVIEW: {
    label: "In Review",
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/15",
  },
  DONE: {
    label: "Done",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15",
  },
};

const priorityStyles: Record<string, { label: string; className: string }> = {
  LOW: {
    label: "Low",
    className:
      "bg-zinc-100 text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 hover:bg-zinc-100",
  },
  MEDIUM: {
    label: "Medium",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/15",
  },
  HIGH: {
    label: "High",
    className:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-500/15",
  },
  URGENT: {
    label: "Urgent",
    className:
      "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/15 animate-pulse",
  },
};

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
    return (
      <div className="rounded-xl border border-border/60 overflow-hidden bg-background">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[40%] text-xs font-semibold">
                Title
              </TableHead>
              <TableHead className="w-[15%] text-xs font-semibold">
                Status
              </TableHead>
              <TableHead className="w-[15%] text-xs font-semibold">
                Priority
              </TableHead>
              <TableHead className="w-[15%] text-xs font-semibold">
                Assignee
              </TableHead>
              <TableHead className="w-[10%] text-xs font-semibold text-right">
                Due Date
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell className="align-middle">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-[60%] rounded-md" />
                    <Skeleton className="h-3.5 w-[40%] rounded-md" />
                  </div>
                </TableCell>
                <TableCell className="align-middle">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell className="align-middle">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell className="align-middle">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </TableCell>
                <TableCell className="align-middle">
                  <Skeleton className="h-4 w-16 ml-auto rounded-md" />
                </TableCell>
                <TableCell className="align-middle text-center">
                  <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
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
              No tasks in this project yet
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1 mb-4">
              Get started by creating your very first project task.
            </p>
            <Button
              onClick={onCreateClick}
              size="sm"
              className="h-9 px-4 text-xs rounded-xl cursor-pointer"
            >
              Create Task
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border/60 overflow-hidden bg-background animate-in fade-in duration-200 [&_[data-slot=table-container]]:max-h-[540px] [&_[data-slot=table-container]]:overflow-y-auto">
        <Table>
          <TableHeader className="bg-muted/85 backdrop-blur-sm sticky top-0 z-10 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]">
            <TableRow>
              <TableHead className="w-[40%] text-xs font-semibold">
                Title
              </TableHead>
              <TableHead className="w-[15%] text-xs font-semibold">
                Status
              </TableHead>
              <TableHead className="w-[15%] text-xs font-semibold">
                Priority
              </TableHead>
              <TableHead className="w-[15%] text-xs font-semibold">
                Assignee
              </TableHead>
              <TableHead className="w-[10%] text-xs font-semibold text-right">
                Due Date
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const status = statusStyles[task.status] || {
                label: task.status,
                className: "",
              };
              const priority = priorityStyles[task.priority] || {
                label: task.priority,
                className: "",
              };

              const isOwnerOrAdmin =
                currentUserRole === "OWNER" || currentUserRole === "ADMIN";
              const isCreator = task.createdById === currentUserId;
              const canDelete = isOwnerOrAdmin || isCreator;

              return (
                <TableRow
                  key={task.id}
                  onClick={() => onRowClick(task)}
                  className="cursor-pointer transition-colors duration-150 hover:bg-muted/20"
                >
                  <TableCell className="font-medium align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-foreground line-clamp-1">
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize",
                        status.className
                      )}
                    >
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-middle">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize",
                        priority.className
                      )}
                    >
                      {priority.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-middle">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={task.assignee.image || ""} />
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                            {task.assignee.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 italic">
                        Unassigned
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right align-middle text-xs text-muted-foreground font-medium">
                    {task.dueDate ? (
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Calendar className="h-3 w-3 text-muted-foreground/75" />
                        <span>
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-center align-middle w-[50px] p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer flex items-center justify-center mx-auto"
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground/80 hover:text-foreground" />
                            <span className="sr-only">Open options</span>
                          </Button>
                        }
                      >
                        <MoreVertical className="h-4 w-4 text-muted-foreground/80 hover:text-foreground" />
                        <span className="sr-only">Open options</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[140px] p-1 rounded-xl shadow-md border border-border/80 bg-popover"
                      >
                        <DropdownMenuItem
                          onClick={() => onRowClick(task)}
                          className="gap-2 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Edit Task</span>
                        </DropdownMenuItem>
                        {canDelete && (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDeleteClick(task)}
                            className="gap-2 cursor-pointer"
                          >
                            <Trash className="h-3.5 w-3.5" />
                            <span>Delete Task</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Sentinel element at the bottom of the table for infinite scroll */}
            <TableRow className="hover:bg-transparent border-0 h-1">
              <TableCell colSpan={6} className="p-0 h-1">
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
      <div className="flex items-center justify-between px-1 py-2 text-muted-foreground animate-in fade-in duration-200">
        <div>
          {tasks.length > 0 && (
            <span className="text-xs text-muted-foreground/80 font-medium">
              Showing {tasks.length} of {totalTasksCount} tasks
            </span>
          )}
        </div>
        <div>
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Loading more tasks...</span>
            </div>
          )}
          {!hasNextPage && tasks.length > 0 && hasMultiplePages && (
            <span className="text-xs text-muted-foreground/75">
              You've reached the end
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
