import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteWorkspaceRequest {
  id: string;
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteWorkspaceRequest) => {
      const response = await fetch(`/api/workspaces/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to delete workspace"
        );
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.id],
      });
    },
  });
}
