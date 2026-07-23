import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteProjectRequest {
  workspaceId: string;
  projectId: string;
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workspaceId, projectId }: DeleteProjectRequest) => {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to delete project"
        );
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },
  });
}
