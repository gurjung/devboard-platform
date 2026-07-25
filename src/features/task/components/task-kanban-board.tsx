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
import { TaskStatus } from "@prisma/client";
import {
  useTasks,
  FetchTasksResponse,
  TaskWithAssignee,
} from "../hooks/use-tasks";
import { useUpdateTask } from "../hooks/use-update-task";
import { TaskKanbanCard } from "./task-kanban-card";
import { useDroppable } from "@dnd-kit/core";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TaskKanbanBoardProps {
  projectId: string;
  searchParams: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
  };
  onTaskClick: (task: TaskWithAssignee) => void;
}

const COLUMNS: {
  id: TaskStatus;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}[] = [
  {
    id: "BACKLOG",
    label: "Backlog",
    bgClass: "bg-zinc-50 dark:bg-zinc-950/20",
    borderClass: "border-zinc-200/50 dark:border-zinc-800/40",
    textClass: "text-muted-foreground",
  },
  {
    id: "TODO",
    label: "Todo",
    bgClass: "bg-blue-50/30 dark:bg-blue-950/10",
    borderClass: "border-blue-150/40 dark:border-blue-900/30",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    bgClass: "bg-amber-50/30 dark:bg-amber-950/10",
    borderClass: "border-amber-150/40 dark:border-amber-900/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "IN_REVIEW",
    label: "In Review",
    bgClass: "bg-purple-50/30 dark:bg-purple-950/10",
    borderClass: "border-purple-150/40 dark:border-purple-900/30",
    textClass: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "DONE",
    label: "Done",
    bgClass: "bg-emerald-50/30 dark:bg-emerald-950/10",
    borderClass: "border-emerald-150/40 dark:border-emerald-900/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
];

const priorityWeights: Record<string, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function sortTasks(a: TaskWithAssignee, b: TaskWithAssignee) {
  // 1. Priority descending (URGENT > HIGH > MEDIUM > LOW)
  const weightA = priorityWeights[a.priority] ?? 0;
  const weightB = priorityWeights[b.priority] ?? 0;
  if (weightA !== weightB) {
    return weightB - weightA;
  }

  // 2. Due Date ascending (soonest first, nulls last)
  if (a.dueDate && b.dueDate) {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
  } else if (a.dueDate) {
    return -1; // a first
  } else if (b.dueDate) {
    return 1; // b first
  }

  // 3. Created At ascending (oldest first as tiebreaker)
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

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

function KanbanColumn({
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

export function TaskKanbanBoard({
  projectId,
  searchParams,
  onTaskClick,
}: TaskKanbanBoardProps) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Filters from URL state (consistent with table view)
  const filters = {
    status: searchParams.status || undefined,
    priority: searchParams.priority || undefined,
    assigneeId: searchParams.assigneeId || undefined,
    dueDate: searchParams.dueDate || undefined,
    pageSize: 1000, // Fetch all matching tasks at once
  };

  const { data, isLoading, isError } = useTasks(projectId, filters);
  const updateMutation = useUpdateTask(projectId);

  // Get all pending update mutations to determine which tasks are currently saving
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

  const tasks = data?.pages.flatMap((page) => page.tasks) || [];

  // Setup sensors for mouse/touch vs keyboard access
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require dragging at least 8px before initiating drag, leaving standard click events uninhibited
      },
    }),
    useSensor(KeyboardSensor)
  );

  if (isLoading) {
    return <TaskKanbanSkeleton />;
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

  // 1. Group tasks by status columns
  const groupedTasks: Record<TaskStatus, TaskWithAssignee[]> = {
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  };

  tasks.forEach((task) => {
    if (groupedTasks[task.status]) {
      groupedTasks[task.status].push(task);
    }
  });

  // 2. Sort tasks inside each column
  COLUMNS.forEach((col) => {
    groupedTasks[col.id].sort(sortTasks);
  });

  const activeTask = tasks.find((t) => t.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // 1. Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });

    // 2. Snapshot current values
    const queryKey = ["tasks", projectId, filters];
    const previousData =
      queryClient.getQueryData<InfiniteData<FetchTasksResponse>>(queryKey);

    // 3. Optimistically update task in cache
    queryClient.setQueryData<InfiniteData<FetchTasksResponse>>(
      queryKey,
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            tasks: page.tasks.map((t) =>
              t.id === taskId ? { ...t, status: newStatus } : t
            ),
          })),
        };
      }
    );

    // 4. Fire mutation
    updateMutation.mutate(
      { taskId, data: { status: newStatus } },
      {
        onError: (err: any) => {
          // Rollback to snapshot
          if (previousData) {
            queryClient.setQueryData(queryKey, previousData);
          }
          toast.error(err.message || "Failed to update task status");
        },
        onSuccess: () => {
          toast.success(
            `Task moved to ${COLUMNS.find((c) => c.id === newStatus)?.label}`
          );
        },
        onSettled: () => {
          // Refetch/invalidate to keep backend in sync
          queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        },
      }
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6 select-none">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.label}
            tasks={groupedTasks[col.id]}
            onEditTask={onTaskClick}
            bgClass={col.bgClass}
            borderClass={col.borderClass}
            textClass={col.textClass}
            pendingTaskIds={pendingTaskIds}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.89, 0.32, 1.28)",
        }}
      >
        {activeTask ? (
          <TaskKanbanCard task={activeTask} dragDisabled={true} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function TaskKanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          className={cn(
            "flex flex-col gap-4 p-4 rounded-2xl border min-h-[550px]",
            col.bgClass,
            col.borderClass
          )}
        >
          {/* Skeleton Header */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4.5 w-6 rounded-full" />
            </div>
          </div>

          {/* Skeleton Cards */}
          <div className="flex flex-col gap-3 flex-1">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 p-4 rounded-xl border border-border/60 bg-card"
              >
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-[75%] rounded-md" />
                  <Skeleton className="h-3 w-[45%] rounded-md" />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-3.5 w-14 rounded-md" />
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-2.5 mt-0.5">
                  <Skeleton className="h-3.5 w-14 rounded-md" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-5.5 w-5.5 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
