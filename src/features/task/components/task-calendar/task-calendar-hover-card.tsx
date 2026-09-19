"use client";

import * as React from "react";
import { format } from "date-fns";
import { TaskWithAssignee } from "../../hooks/use-tasks";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskCalendarHoverCardProps {
  task: TaskWithAssignee;
  children: React.ReactNode;
}

const statusLabels: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const priorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-muted/50 text-muted-foreground border border-border/50",
  MEDIUM: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  URGENT: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const statusStyles: Record<string, string> = {
  BACKLOG: "bg-muted/50 text-muted-foreground border border-border/50",
  TODO: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  IN_PROGRESS:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  IN_REVIEW:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  DONE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export function TaskCalendarHoverCard({
  task,
  children,
}: TaskCalendarHoverCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="w-full focus:outline-none cursor-pointer">
            {children}
          </div>
        }
      />
      <TooltipContent
        className="w-72 bg-popover text-popover-foreground border border-border/80 shadow-2xl p-4 rounded-2xl flex flex-col gap-3 text-xs z-50 text-left font-normal select-none pointer-events-none"
        side="top"
        align="center"
      >
        {/* Header: Title */}
        <div className="flex flex-col gap-1.5 border-b border-border/40 pb-2.5">
          <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider">
            Task Details
          </span>
          <h4 className="font-bold text-xs text-foreground leading-snug">
            {task.title}
          </h4>
        </div>

        {/* Description */}
        {task.description ? (
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider">
              Description
            </span>
            <p className="text-muted-foreground/90 leading-relaxed line-clamp-3">
              {task.description}
            </p>
          </div>
        ) : null}

        {/* Status & Priority Badge Details */}
        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-border/40">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider">
              Status
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit",
                statusStyles[task.status]
              )}
            >
              {statusLabels[task.status]}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider">
              Priority
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit",
                priorityStyles[task.priority]
              )}
            >
              {priorityLabels[task.priority]}
            </Badge>
          </div>
        </div>

        {/* Due Date & Assignee details */}
        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-border/40">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider">
              Due Date
            </span>
            <span className="font-semibold text-foreground/90">
              {task.dueDate
                ? format(new Date(task.dueDate), "MMM d, yyyy")
                : "No due date"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider">
              Assignee
            </span>
            {task.assignee ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Avatar className="h-4.5 w-4.5 border border-background">
                  <AvatarImage
                    src={task.assignee.image || ""}
                    alt={task.assignee.name || ""}
                  />
                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                    {task.assignee.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground/95 truncate max-w-[90px]">
                  {task.assignee.name}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground/60 italic mt-0.5">
                Unassigned
              </span>
            )}
          </div>
        </div>

        {/* Creator footer */}
        <div className="border-t border-border/30 pt-2 flex items-center justify-between text-[9px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          <span>Created By</span>
          <span className="normal-case font-bold text-foreground/70">
            {task.createdBy.name}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Simple Helper function
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
