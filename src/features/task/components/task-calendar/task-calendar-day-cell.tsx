"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { format, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskWithAssignee } from "../../hooks/use-tasks";
import { TaskKanbanCard } from "../task-kanban/task-kanban-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TaskCalendarHoverCard } from "./task-calendar-hover-card";

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  tasks: TaskWithAssignee[];
  onTaskClick: (task: TaskWithAssignee) => void;
  pendingTaskIds: Set<string>;
}

export function CalendarDayCell({
  day,
  currentMonth,
  tasks,
  onTaskClick,
  pendingTaskIds,
}: CalendarDayCellProps) {
  const dateKey = day.toISOString();
  const { setNodeRef, isOver } = useDroppable({
    id: dateKey,
  });

  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isDayToday = isToday(day);

  // Cap visible tasks at 3
  const visibleTasks = tasks.slice(0, 3);
  const extraTasks = tasks.slice(3);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-1.5 p-2 border border-border/30 min-h-[140px] bg-card/25 transition-all duration-200 rounded-xl relative",
        !isCurrentMonth && "bg-muted/5 opacity-55",
        isOver &&
          "ring-2 ring-primary/20 bg-primary/[0.02] border-primary/30 z-10",
        isDayToday && "border-primary/20 bg-primary/[0.01]"
      )}
    >
      {/* Cell Header */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-semibold text-muted-foreground/80 w-6 h-6 flex items-center justify-center rounded-full transition-colors",
            isDayToday && "bg-primary text-primary-foreground font-bold",
            !isCurrentMonth && "text-muted-foreground/40"
          )}
        >
          {format(day, "d")}
        </span>
        {tasks.length > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground/80 border border-border/20 scale-90">
            {tasks.length}
          </span>
        )}
      </div>

      {/* Task Cards list */}
      <div className="flex flex-col gap-1.5 flex-1 select-none">
        {visibleTasks.map((task) => (
          <div key={task.id} className="scale-[0.96] origin-top">
            <TaskCalendarHoverCard task={task}>
              <TaskKanbanCard
                task={task}
                onEdit={onTaskClick}
                isUpdating={pendingTaskIds.has(task.id)}
                compact={true}
                showStatus
              />
            </TaskCalendarHoverCard>
          </div>
        ))}

        {extraTasks.length > 0 && (
          <div className="mt-auto pt-1 flex justify-center">
            <Popover>
              <PopoverTrigger
                render={
                  <button className="text-[10px] text-primary hover:text-primary/80 font-bold px-2 py-0.5 bg-primary/5 hover:bg-primary/10 rounded-md transition-colors cursor-pointer border border-primary/10" />
                }
              >
                +{extraTasks.length} more
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-3 border border-border/80 rounded-2xl bg-popover shadow-xl max-h-80 overflow-y-auto"
                align="center"
              >
                <div className="flex flex-col gap-2">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider border-b border-border/40 pb-2 mb-1 flex items-center justify-between">
                    <span>Tasks for {format(day, "MMMM d")}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-semibold">
                      {tasks.length} total
                    </span>
                  </h4>
                  <div className="flex flex-col gap-2 px-1.5 py-1">
                    {tasks.map((task: TaskWithAssignee) => (
                      <TaskCalendarHoverCard key={task.id} task={task}>
                        <TaskKanbanCard
                          task={task}
                          onEdit={onTaskClick}
                          dragDisabled={true}
                          isUpdating={pendingTaskIds.has(task.id)}
                        />
                      </TaskCalendarHoverCard>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
}
