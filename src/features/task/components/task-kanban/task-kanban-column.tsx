"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { TaskStatus } from "@prisma/client";
import { TaskWithAssignee } from "../../hooks/use-tasks";
import { TaskKanbanCard } from "./task-kanban-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: TaskWithAssignee[];
  onEditTask: (task: TaskWithAssignee) => void;
  bgClass: string;
  borderClass: string;
  textClass: string;
  pendingTaskIds: Set<string>;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onEditTask,
  bgClass,
  borderClass,
  textClass,
  pendingTaskIds,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-4 p-4 rounded-2xl border min-h-[550px] transition-all duration-200 w-full shrink-0",
        bgClass,
        borderClass,
        isOver ? "ring-2 ring-primary/20 bg-muted/30 border-primary/30" : ""
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "text-xs font-bold uppercase tracking-wider",
              textClass
            )}
          >
            {title}
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground/90 border border-border/20">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[650px] pr-0.5 scrollbar-thin flex-1">
        {tasks.map((task) => (
          <TaskKanbanCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            isUpdating={pendingTaskIds.has(task.id)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center border border-dashed border-border/60 rounded-xl p-8 text-center h-32 bg-muted/5 select-none">
            <p className="text-[11px] font-medium text-muted-foreground/60">
              No tasks here
            </p>
            <p className="text-[9px] text-muted-foreground/40 mt-1">
              Drag a task here to update status
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
