import { useQuery, useMutation } from "@tanstack/react-query";

export function useInvite(token: string) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: async () => {
      const response = await fetch(`/api/invites/${token}`);
      const result = await response.json();
      // We return the result JSON directly (including success: false and reasons like EXPIRED/REVOKED)
      // because our component handles these states gracefully as UI flows instead of raw crash errors.
      return result;
    },
    enabled: !!token,
    retry: false, // Don't retry since token status is static
  });
}

export function useAcceptInvite() {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch(`/api/invites/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        const error = new Error(
          result.error || result.message || "Failed to accept invite"
        );
        (error as any).status = response.status;
        throw error;
      }

      return result;
    },
  });
}
