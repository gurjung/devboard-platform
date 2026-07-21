import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateWorkspaceInput } from "../schema";

interface UpdateWorkspaceRequest {
  id: string;
  data: CreateWorkspaceInput;
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateWorkspaceRequest) => {
      const response = await fetch(`/api/workspaces/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to update workspace"
        );
      }

      return result;
    },
    onSuccess: (updatedWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", updatedWorkspace.id],
      });
    },
  });
}
