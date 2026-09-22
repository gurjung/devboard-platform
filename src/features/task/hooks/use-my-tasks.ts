import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { TaskWithAssignee } from "./use-tasks";

export type TaskWithAssigneeAndProject = TaskWithAssignee;

export interface FetchMyTasksResponse {
  tasks: TaskWithAssigneeAndProject[];
  nextCursor: string | null;
  totalCount: number;
}

export interface UseMyTasksFilters {
  status?: string;
  priority?: string;
  dueDate?: string;
  pageSize?: number;
}

export function useMyTasks(
  workspaceIdOrFilters?: string | UseMyTasksFilters,
  filtersArg?: UseMyTasksFilters
) {
  const params = useParams();
  const routeWorkspace =
    (params?.workspaceSlug as string) || (params?.workspaceId as string);

  const workspaceId =
    typeof workspaceIdOrFilters === "string"
      ? workspaceIdOrFilters
      : routeWorkspace;

  const filters =
    (typeof workspaceIdOrFilters === "object"
      ? workspaceIdOrFilters
      : filtersArg) || {};

  return useInfiniteQuery<FetchMyTasksResponse>({
    queryKey: ["my-tasks", workspaceId, filters],
    queryFn: async ({ pageParam = null }) => {
      const searchParams = new URLSearchParams();

      if (filters.status) searchParams.append("status", filters.status);
      if (filters.priority) searchParams.append("priority", filters.priority);
      if (filters.dueDate) searchParams.append("dueDate", filters.dueDate);
      if (filters.pageSize)
        searchParams.append("pageSize", filters.pageSize.toString());
      if (pageParam) searchParams.append("cursor", pageParam as string);

      const response = await fetch(
        `/api/workspaces/${workspaceId}/my-tasks?${searchParams.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch tasks");
      }

      return result;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!workspaceId,
  });
}
