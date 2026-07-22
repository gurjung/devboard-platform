import { useQuery } from "@tanstack/react-query";
import { WorkspaceRole } from "@prisma/client";

export interface WorkspaceMemberData {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery<WorkspaceMemberData[]>({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to fetch workspace members"
        );
      }

      return result.data;
    },
    enabled: !!workspaceId,
  });
}
