"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { WorkspaceMembershipResult } from "@/lib/workspace-auth";
import { useMyTasks } from "../hooks/use-my-tasks";
import { TaskWithAssignee } from "../hooks/use-tasks";
import { TaskFilters } from "./task-filters/task-filters";
import { TaskTable } from "./task-table/task-table";
import { EditTaskDialog } from "./edit-task-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MyTasksClientProps {
  workspaceId: string;
  workspaceSlug: string;
  workspaceName?: string;
  membership: WorkspaceMembershipResult["membership"];
  searchParams: {
    status?: string;
    priority?: string;
    dueDate?: string;
  };
}

export function MyTasksClient({
  workspaceId,
  workspaceSlug,
  workspaceName: propWorkspaceName,
  membership,
  searchParams,
}: MyTasksClientProps) {
  const workspaceName =
    propWorkspaceName || membership.workspace?.name || workspaceSlug;
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [selectedTaskForEdit, setSelectedTaskForEdit] =
    useState<TaskWithAssignee | null>(null);
  const [taskForDelete, setTaskForDelete] = useState<TaskWithAssignee | null>(
    null
  );

  // Extract filter parameters
  const status = searchParams.status || "";
  const priority = searchParams.priority || "";
  const dueDate = searchParams.dueDate || "";

  const isFiltered = !!(status || priority || dueDate);

  // React Query Fetch My Tasks
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useMyTasks(workspaceId, {
    status: status || undefined,
    priority: priority || undefined,
    dueDate: dueDate || undefined,
    pageSize: 10,
  });

  const tasks = data?.pages.flatMap((page) => page.tasks) || [];

  const deleteMutation = useMutation({
    mutationFn: async (task: TaskWithAssignee) => {
      const response = await fetch(
        `/api/projects/${task.projectId}/tasks/${task.id}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to delete task"
        );
      }
      return result;
    },
    onSuccess: (_data, task) => {
      toast.success("Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-tasks", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", task.projectId] });
      setTaskForDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete task");
    },
  });

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
    params.delete("dueDate");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteConfirm = () => {
    if (!taskForDelete) return;
    deleteMutation.mutate(taskForDelete);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Tasks
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {workspaceName}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Tasks assigned to you across all projects in{" "}
            <span className="font-medium text-foreground">{workspaceName}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TaskFilters
            workspaceId={workspaceId}
            status={status}
            priority={priority}
            dueDate={dueDate}
            hideAssignee={true}
            onStatusChange={(v) => updateQueryParam("status", v)}
            onPriorityChange={(v) => updateQueryParam("priority", v)}
            onDueDateChange={(v) => updateQueryParam("dueDate", v)}
            onClearFilters={handleClearFilters}
            isFiltered={isFiltered}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative">
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
          currentUserId={membership?.userId || ""}
          currentUserRole={membership?.role || ""}
          hasMultiplePages={(data?.pages.length ?? 0) > 1}
          totalTasksCount={data?.pages[0]?.totalCount ?? 0}
          showProjectColumn={true}
          workspaceSlug={workspaceSlug}
        />
      </div>

      {/* Dialogs */}
      {selectedTaskForEdit && (
        <EditTaskDialog
          projectId={selectedTaskForEdit.projectId}
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
