import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUpdateWorkspace } from "../use-update-workspace";

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

describe("useUpdateWorkspace hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("should send PATCH request and invalidate caches on success", async () => {
    const mockResponse = { id: "123", name: "Updated Workspace" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateWorkspace(), { wrapper });

    result.current.mutate({
      id: "123",
      data: { name: "Updated Workspace" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/workspaces/123",
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Workspace" }),
      }),
    );

    expect(result.current.data).toEqual(mockResponse);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["workspaces"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["workspace", "123"],
    });
  });

  it("should throw error on update failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "Update failed" }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateWorkspace(), { wrapper });

    result.current.mutate({
      id: "123",
      data: { name: "Updated Workspace" },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("Update failed");
  });
});
