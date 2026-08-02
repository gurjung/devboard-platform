"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceMembershipResult } from "@/lib/workspace-auth";
import { Project } from "@prisma/client";
import { useTasks, TaskWithAssignee } from "../hooks/use-tasks";
import { ViewSelector } from "./view-selector";
import { TaskFilters } from "./task-filters/task-filters";
import { TaskTable } from "./task-table/task-table";
import { TaskKanbanBoard } from "./task-kanban/task-kanban-board";
import { TaskCalendarBoard } from "./task-calendar/task-calendar-board";
import { CreateTaskDialog } from "./create-task-dialog";
import { EditTaskDialog } from "./edit-task-dialog";
import { useDeleteTask } from "../hooks/use-delete-task";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";

interface TasksDashboardClientProps {
  project: Project;
  workspaceId: string;
  workspaceSlug: string;
  projectSlug: string;
  membership: WorkspaceMembershipResult["membership"];
  searchParams: {
    view?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
  };
}

export function TasksDashboardClient({
  project,
  workspaceId,
  workspaceSlug,
  projectSlug,
  membership,
  searchParams,
}: TasksDashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] =
    useState<TaskWithAssignee | null>(null);
  const [taskForDelete, setTaskForDelete] = useState<TaskWithAssignee | null>(
    null
  );

  const deleteMutation = useDeleteTask(project.id);

  // Extract parameters
  const view = searchParams.view || "table";
  const status = searchParams.status || "";
  const priority = searchParams.priority || "";
  const assigneeId = searchParams.assigneeId || "";
  const dueDate = searchParams.dueDate || "";

  const isFiltered = !!(status || priority || assigneeId || dueDate);

  // React Query Fetch Tasks
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useTasks(project.id, {
    status: status || undefined,
    priority: priority || undefined,
    assigneeId: assigneeId || undefined,
    dueDate: dueDate || undefined,
    pageSize: 10,
  });

  const tasks = data?.pages.flatMap((page) => page.tasks) || [];

  // URL State Updates
  const updateQueryParam = (name: string, value: string) => {
    const params = new URLSearchParams(rawSearchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(rawSearchParams.toString());
    params.delete("status");
    params.delete("priority");
    params.delete("assigneeId");
    params.delete("dueDate");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteConfirm = () => {
    if (!taskForDelete) return;
    deleteMutation.mutate(taskForDelete.id, {
      onSuccess: () => {
        toast.success("Task deleted successfully");
        setTaskForDelete(null);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to delete task");
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {project.name} Tasks
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
            Tasks
          </span>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-9 text-xs rounded-xl px-4 cursor-pointer gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Toolbar / Selectors */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <ViewSelector
            currentView={view}
            onViewChange={(newView) => updateQueryParam("view", newView)}
          />
          <TaskFilters
            workspaceId={workspaceId}
            status={status}
            priority={priority}
            assigneeId={assigneeId}
            dueDate={dueDate}
            onStatusChange={(v) => updateQueryParam("status", v)}
            onPriorityChange={(v) => updateQueryParam("priority", v)}
            onAssigneeChange={(v) => updateQueryParam("assigneeId", v)}
            onDueDateChange={(v) => updateQueryParam("dueDate", v)}
            onClearFilters={handleClearFilters}
            isFiltered={isFiltered}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {view === "table" ? (
          <TaskTable
            tasks={tasks}
            isLoading={isLoading}
            isError={isError}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            onRowClick={(task) => setSelectedTaskForEdit(task)}
            onDeleteClick={(task) => setTaskForDelete(task)}
            isFiltered={isFiltered}
            onCreateClick={() => setIsCreateOpen(true)}
            currentUserId={membership?.userId || ""}
            currentUserRole={membership?.role || ""}
            hasMultiplePages={(data?.pages.length ?? 0) > 1}
            totalTasksCount={data?.pages[0]?.totalCount ?? 0}
          />
        ) : view === "kanban" ? (
          <TaskKanbanBoard
            projectId={project.id}
            searchParams={searchParams}
            onTaskClick={(task) => setSelectedTaskForEdit(task)}
          />
        ) : view === "calendar" ? (
          <TaskCalendarBoard
            projectId={project.id}
            searchParams={searchParams}
            onTaskClick={(task) => setSelectedTaskForEdit(task)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-border/80 rounded-2xl p-12 text-center bg-muted/10">
            <p className="text-sm font-medium text-muted-foreground capitalize">
              {view} view coming soon
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Currently, only the Table, Kanban and Calendar views are supported
              in this phase.
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateTaskDialog
        projectId={project.id}
        workspaceId={workspaceId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {selectedTaskForEdit && (
        <EditTaskDialog
          projectId={project.id}
          workspaceId={workspaceId}
          task={selectedTaskForEdit}
          membership={membership}
          open={!!selectedTaskForEdit}
          onOpenChange={(open) => {
            if (!open) setSelectedTaskForEdit(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!taskForDelete}
        onOpenChange={(open) => {
          if (!open) setTaskForDelete(null);
        }}
        title="Delete Task"
        description={`Are you sure you want to delete "${taskForDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmLoadingLabel="Deleting..."
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
