"use client";

import * as React from "react";
import { TaskWithAssignee } from "../../hooks/use-tasks";
import { TaskKanbanCard } from "../task-kanban/task-kanban-card";
interface TaskCalendarUndatedPanelProps {
  tasks: TaskWithAssignee[];
  onTaskClick: (task: TaskWithAssignee) => void;
  pendingTaskIds: Set<string>;
}

export function TaskCalendarUndatedPanel({
  tasks,
  onTaskClick,
  pendingTaskIds,
}: TaskCalendarUndatedPanelProps) {
  return (
    <div className="lg:col-span-1 flex flex-col gap-4 p-4 rounded-2xl border border-border/40 bg-zinc-50/30 dark:bg-zinc-950/10 min-h-[450px]">
      <div className="border-b border-border/40 pb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          No due date
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/20">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] px-1.5 py-1.5 scrollbar-thin flex-1">
        {tasks.map((task: TaskWithAssignee) => (
          <TaskKanbanCard
            key={task.id}
            task={task}
            onEdit={onTaskClick}
            dragDisabled={true}
            isUpdating={pendingTaskIds.has(task.id)}
            showStatus={true}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center border border-dashed border-border/60 rounded-xl p-8 text-center h-32 bg-muted/5 select-none">
            <p className="text-[11px] font-medium text-muted-foreground/60">
              No undated tasks
            </p>
            <p className="text-[9px] text-muted-foreground/40 mt-1">
              Assign due dates to schedule them
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
