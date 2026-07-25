"use client";

import * as React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Calendar, Loader2 } from "lucide-react";
import { TaskWithAssignee } from "../hooks/use-tasks";
import { cn } from "@/lib/utils";

interface TaskKanbanCardProps {
  task: TaskWithAssignee;
  onEdit?: (task: TaskWithAssignee) => void;
  dragDisabled?: boolean;
  isUpdating?: boolean;
}

const priorityStyles: Record<string, { label: string; className: string }> = {
  LOW: {
    label: "Low",
    className:
      "bg-zinc-100 text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 hover:bg-zinc-100/80 border border-zinc-200/50 dark:border-zinc-700/50",
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

export function TaskKanbanCard({
  task,
  onEdit,
  dragDisabled = false,
  isUpdating = false,
}: TaskKanbanCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: dragDisabled || isUpdating,
  });

  const priority = priorityStyles[task.priority] || {
    label: task.priority,
    className: "",
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If we're dragging, don't trigger the click edit
    if (isDragging) return;
    if (onEdit) {
      onEdit(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col gap-3 p-4 rounded-xl border border-border/60 bg-card text-card-foreground shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-grab active:cursor-grabbing select-none",
        !dragDisabled && "hover:border-foreground/15 hover:shadow-xs",
        isDragging && "opacity-40 border-dashed border-border/80 shadow-none",
        isUpdating &&
          "border-primary/30 bg-primary/[0.01] shadow-none cursor-wait",
        dragDisabled &&
          "shadow-md border-primary/20 scale-[1.02] cursor-grabbing"
      )}
    >
      {/* Title & Description */}
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-semibold leading-normal text-foreground group-hover:text-primary transition-colors duration-150 line-clamp-2">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Badges & Meta Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider",
              priority.className
            )}
          >
            {priority.label}
          </Badge>
          {isUpdating && (
            <span className="flex items-center gap-1 text-[9px] text-primary/80 font-bold animate-pulse">
              <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
              <span>Saving...</span>
            </span>
          )}
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/90 font-medium">
            <Calendar className="h-3 w-3 text-muted-foreground/70" />
            <span>{format(new Date(task.dueDate), "MMM d")}</span>
          </div>
        )}
      </div>

      {/* Assignee Footer */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-0.5">
        <span className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Assignee
        </span>
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5.5 w-5.5 border border-background">
              <AvatarImage
                src={task.assignee.image || ""}
                alt={task.assignee.name || ""}
              />
              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                {task.assignee.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-medium text-foreground max-w-[85px] truncate">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground/65 italic font-medium">
            Unassigned
          </span>
        )}
      </div>
    </div>
  );
}
