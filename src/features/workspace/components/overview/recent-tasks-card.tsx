import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  CheckSquare,
  Calendar,
  ArrowRight,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { cn } from "@/lib/utils";

export interface DashboardTaskItem {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  project: {
    id: string;
    name: string;
    slug: string;
  };
}

interface RecentTasksCardProps {
  workspaceSlug: string;
  tasks: DashboardTaskItem[];
}

const statusBadgeStyles: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  BACKLOG: {
    label: "Backlog",
    className: "bg-muted/80 text-muted-foreground border-border/70",
  },
  TODO: {
    label: "Todo",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  IN_REVIEW: {
    label: "In Review",
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  DONE: {
    label: "Done",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
};

export function RecentTasksCard({
  workspaceSlug,
  tasks,
}: RecentTasksCardProps) {
  const now = new Date();

  return (
    <Card className="flex flex-col justify-between rounded-xl border border-border/80 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                My Recent Tasks
              </CardTitle>
              <CardDescription className="text-xs">
                Your highest-priority & soonest due tasks
              </CardDescription>
            </div>
          </div>
          {tasks.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No tasks assigned to you
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
              You&apos;re all caught up! Any tasks assigned to you in this
              workspace will show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {tasks.map((task) => {
              const status = statusBadgeStyles[task.status] || {
                label: task.status,
                className: "",
              };
              const isOverdue =
                Boolean(task.dueDate) &&
                task.status !== "DONE" &&
                new Date(task.dueDate!) < now;

              return (
                <Link
                  key={task.id}
                  href={`/dashboard/${workspaceSlug}/projects/${task.project.slug}`}
                  className="group -mx-2 flex flex-col gap-1.5 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {task.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {task.project.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.2 rounded-full whitespace-nowrap",
                        status.className
                      )}
                    >
                      {status.label}
                    </Badge>

                    {task.dueDate ? (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] whitespace-nowrap",
                          isOverdue
                            ? "font-medium text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                        )}
                        title={
                          isOverdue
                            ? `Overdue: ${format(new Date(task.dueDate), "MMM d, yyyy")}`
                            : format(new Date(task.dueDate), "MMM d, yyyy")
                        }
                      >
                        {isOverdue ? (
                          <AlertCircle className="h-3 w-3 shrink-0" />
                        ) : (
                          <Calendar className="h-3 w-3 shrink-0 opacity-70" />
                        )}
                        <span>{format(new Date(task.dueDate), "MMM d")}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">
                        —
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/60">
        <Link
          href={`/dashboard/${workspaceSlug}/my-tasks`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full justify-between text-xs text-muted-foreground hover:text-foreground"
          )}
        >
          <span>Show all assigned tasks</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
