import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWorkspaces } from "../use-workspaces";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe("useWorkspaces hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("should fetch list of workspaces successfully", async () => {
    const mockList = [
      { id: "1", name: "W1" },
      { id: "2", name: "W2" },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockList),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useWorkspaces(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith("/api/workspaces");
    expect(result.current.data).toEqual(mockList);
  });

  it("should throw error when fetch fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "Fetch failed" }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useWorkspaces(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("Fetch failed");
  });
});
