import { useInfiniteQuery } from "@tanstack/react-query";
import { Task, User } from "@prisma/client";

export interface TaskWithAssignee extends Task {
  assignee: Pick<User, "id" | "name" | "email" | "image"> | null;
  createdBy: Pick<User, "id" | "name" | "email" | "image">;
}

export interface FetchTasksResponse {
  tasks: TaskWithAssignee[];
  nextCursor: string | null;
  totalCount: number;
}

export interface UseTasksFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueDate?: string;
  pageSize?: number;
}

export function useTasks(projectId: string, filters: UseTasksFilters = {}) {
  return useInfiniteQuery<FetchTasksResponse>({
    queryKey: ["tasks", projectId, filters],
    queryFn: async ({ pageParam = null }) => {
      const searchParams = new URLSearchParams();

      if (filters.status) searchParams.append("status", filters.status);
      if (filters.priority) searchParams.append("priority", filters.priority);
      if (filters.assigneeId)
        searchParams.append("assigneeId", filters.assigneeId);
      if (filters.dueDate) searchParams.append("dueDate", filters.dueDate);
      if (filters.pageSize)
        searchParams.append("pageSize", filters.pageSize.toString());
      if (pageParam) searchParams.append("cursor", pageParam as string);

      const response = await fetch(
        `/api/projects/${projectId}/tasks?${searchParams.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch tasks");
      }

      return result;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!projectId,
  });
}
