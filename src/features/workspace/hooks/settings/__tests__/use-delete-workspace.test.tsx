import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteWorkspace } from "../use-delete-workspace";

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

describe("useDeleteWorkspace hook", () => {
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

    const { result } = renderHook(() => useDeleteWorkspace(), { wrapper });

    result.current.mutate({ id: "123" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/workspaces/123",
      expect.objectContaining({
        method: "DELETE",
      })
    );

    expect(result.current.data).toEqual(mockResponse);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["workspaces"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["workspace", "123"],
    });
  });

  it("should throw error on deletion failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: "Unauthorized" }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteWorkspace(), { wrapper });

    result.current.mutate({ id: "123" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("Unauthorized");
  });
});
