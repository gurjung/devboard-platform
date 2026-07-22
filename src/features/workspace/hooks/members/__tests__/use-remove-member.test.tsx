import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRemoveMember } from "../use-remove-member";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe("useRemoveMember hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("should send DELETE request and invalidate caches on success", async () => {
    const mockResponse = { success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRemoveMember("workspace-123"), {
      wrapper,
    });

    result.current.mutate("member-456");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/workspaces/workspace-123/members/member-456",
      expect.objectContaining({
        method: "DELETE",
      }),
    );

    expect(result.current.data).toEqual(mockResponse);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["workspace-members", "workspace-123"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["workspaces"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["workspace", "workspace-123"],
    });
  });

  it("should throw error on delete member failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: "Failed to remove" }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRemoveMember("workspace-123"), {
      wrapper,
    });

    result.current.mutate("member-456");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("Failed to remove");
  });
});
