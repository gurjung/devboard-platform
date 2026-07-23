import { useMutation } from "@tanstack/react-query";
import { InviteMemberInput } from "../../schema";

interface InviteMemberRequest {
  workspaceId: string;
  data: InviteMemberInput;
}

export function useInviteMember() {
  return useMutation({
    mutationFn: async ({ workspaceId, data }: InviteMemberRequest) => {
      const response = await fetch(`/api/workspaces/${workspaceId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Construct an error object that preserves status code & messages
        const error = new Error(
          result.message || result.error || "Failed to invite member"
        );
        (error as any).status = response.status;
        (error as any).error = result.error;
        throw error;
      }

      return result;
    },
  });
}
