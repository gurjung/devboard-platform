"use client";

import * as React from "react";
import { useState } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  useQueryClient,
  InfiniteData,
  useMutationState,
} from "@tanstack/react-query";
import {
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  addDays,
  subMonths,
  addMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  useTasks,
  FetchTasksResponse,
  TaskWithAssignee,
} from "../../hooks/use-tasks";
import { useUpdateTask } from "../../hooks/use-update-task";
import { TaskKanbanCard } from "../task-kanban/task-kanban-card";
// Sub-components
import { CalendarDayCell } from "./task-calendar-day-cell";
import { TaskCalendarSkeleton } from "./task-calendar-skeleton";
import { TaskCalendarUndatedPanel } from "./task-calendar-undated-panel";
import { TaskCalendarPicker } from "./task-calendar-picker";

interface TaskCalendarBoardProps {
  projectId: string;
  searchParams: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
  };
  onTaskClick: (task: TaskWithAssignee) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TaskCalendarBoard({
  projectId,
  searchParams,
  onTaskClick,
}: TaskCalendarBoardProps) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());

  const filters = {
    status: searchParams.status || undefined,
    priority: searchParams.priority || undefined,
    assigneeId: searchParams.assigneeId || undefined,
    dueDate: searchParams.dueDate || undefined,
    pageSize: 1000, // Fetch all matching tasks for the project
  };

  const { data, isLoading, isError } = useTasks(projectId, filters);
  const updateMutation = useUpdateTask(projectId);

  // Get pending mutations
  const pendingMutations = useMutationState({
    filters: { status: "pending" },
    select: (mutation) => mutation.state.variables as any,
  });

  const pendingTaskIds = React.useMemo(() => {
    return new Set<string>(
      pendingMutations
        .filter((vars) => vars && typeof vars === "object" && "taskId" in vars)
        .map((vars) => vars.taskId as string)
    );
  }, [pendingMutations]);

  const tasks =
    data?.pages.flatMap((page: FetchTasksResponse) => page.tasks) || [];

  // Split tasks into two groups
  const tasksWithDueDate = tasks.filter((t: TaskWithAssignee) => t.dueDate);
  const tasksWithoutDueDate = tasks.filter((t: TaskWithAssignee) => !t.dueDate);

  // Sensors for drag/drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Activation threshold: allows clicks vs drags
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Generate 6 weeks month grid
  const days = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [currentMonth]);

  const activeTask = tasks.find((t: TaskWithAssignee) => t.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newDueDateISO = over.id as string; // Target day ISO Date String

    const task = tasks.find((t: TaskWithAssignee) => t.id === taskId);
    if (!task) return;

    // Check if the due date is actually different
    if (
      task.dueDate &&
      isSameDay(new Date(task.dueDate), new Date(newDueDateISO))
    ) {
      return;
    }

    // 1. Cancel query to avoid overwriting optimistic updates
    await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });

    // 2. Snapshot current state
    const queryKey = ["tasks", projectId, filters];
    const previousData =
      queryClient.getQueryData<InfiniteData<FetchTasksResponse>>(queryKey);

    // 3. Optimistically update task due date in cache
    queryClient.setQueryData<InfiniteData<FetchTasksResponse>>(
      queryKey,
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: FetchTasksResponse) => ({
            ...page,
            tasks: page.tasks.map((t: TaskWithAssignee) =>
              t.id === taskId ? { ...t, dueDate: new Date(newDueDateISO) } : t
            ),
          })),
        };
      }
    );

    // 4. Fire mutation
    updateMutation.mutate(
      { taskId, data: { dueDate: new Date(newDueDateISO) } },
      {
        onError: (err: any) => {
          if (previousData) {
            queryClient.setQueryData(queryKey, previousData);
          }
          toast.error(err.message || "Failed to reschedule task");
        },
        onSuccess: () => {
          toast.success(
            `Task rescheduled to ${format(new Date(newDueDateISO), "MMM d, yyyy")}`
          );
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        },
      }
    );
  };

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleMonthChange = (monthStr: string | null) => {
    if (!monthStr) return;
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(parseInt(monthStr, 10));
      return next;
    });
  };

  const handleYearChange = (yearStr: string | null) => {
    if (!yearStr) return;
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setFullYear(parseInt(yearStr, 10));
      return next;
    });
  };

  if (isLoading) {
    return <TaskCalendarSkeleton />;
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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 select-none">
        {/* Calendar Grid Section */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Header Controls */}
          <TaskCalendarPicker
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
          />

          {/* Weekday Titles & Grid Cells with horizontal scroll wrapper */}
          <div className="overflow-x-auto pb-4 scrollbar-thin">
            <div className="min-w-[768px] lg:min-w-0 flex flex-col gap-2">
              {/* Weekday Titles */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {WEEKDAYS.map((day) => (
                  <span
                    key={day}
                    className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Grid Cells */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const dayTasks = tasksWithDueDate.filter(
                    (t: TaskWithAssignee) => {
                      if (!t.dueDate) return false;
                      return isSameDay(new Date(t.dueDate), day);
                    }
                  );

                  return (
                    <CalendarDayCell
                      key={day.toISOString()}
                      day={day}
                      currentMonth={currentMonth}
                      tasks={dayTasks}
                      onTaskClick={onTaskClick}
                      pendingTaskIds={pendingTaskIds}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Panel: No Due Date Tasks */}
        <TaskCalendarUndatedPanel
          tasks={tasksWithoutDueDate}
          onTaskClick={onTaskClick}
          pendingTaskIds={pendingTaskIds}
        />
      </div>

      {/* Drag Overlay for active task preview */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.89, 0.32, 1.28)",
        }}
      >
        {activeTask ? (
          <div className="opacity-90 scale-95 shadow-2xl pointer-events-none">
            <TaskKanbanCard task={activeTask} dragDisabled={true} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
