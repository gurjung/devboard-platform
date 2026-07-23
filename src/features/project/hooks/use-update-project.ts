import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateProjectInput } from "../schema";

interface UpdateProjectRequest {
  workspaceId: string;
  projectId: string;
  data: UpdateProjectInput;
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      projectId,
      data,
    }: UpdateProjectRequest) => {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/projects/${projectId}`,
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
          result.error || result.message || "Failed to update project"
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
