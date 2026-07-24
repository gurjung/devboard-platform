import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateTaskInput } from "../schema";

interface UpdateTaskRequest {
  taskId: string;
  data: UpdateTaskInput;
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: UpdateTaskRequest) => {
      const response = await fetch(
        `/api/projects/${projectId}/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to update task"
        );
      }

      return result;
    },
    onSuccess: (updatedTask: any) => {
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ["tasks", projectId] })
        .forEach((query) => {
          queryClient.setQueryData(query.queryKey, (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                tasks: page.tasks.map((task: any) =>
                  task.id === updatedTask.id ? updatedTask : task
                ),
              })),
            };
          });
        });
    },
  });
}
