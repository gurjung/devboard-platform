import { useQuery } from "@tanstack/react-query";

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const response = await fetch(`/api/workspaces/${workspaceId}/projects`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to fetch projects"
        );
      }

      return result;
    },
    enabled: !!workspaceId,
  });
}
