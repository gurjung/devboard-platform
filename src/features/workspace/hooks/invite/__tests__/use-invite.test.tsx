import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useInvite, useAcceptInvite } from "../use-invite";

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

describe("useInvite hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("should fetch invite details successfully", async () => {
    const mockDetails = { success: true, workspaceName: "My Workspace" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockDetails),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useInvite("token-123"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith("/api/invites/token-123");
    expect(result.current.data).toEqual(mockDetails);
  });

  it("should send POST request and return accept response on success", async () => {
    const mockAcceptResponse = {
      success: true,
      workspaceSlug: "workspace-slug",
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockAcceptResponse),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAcceptInvite(), { wrapper });

    result.current.mutate("token-123");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/invites/token-123",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(result.current.data).toEqual(mockAcceptResponse);
  });

  it("should throw error on accept invite failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: jest.fn().mockResolvedValue({ error: "Access Denied" }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useAcceptInvite(), { wrapper });

    result.current.mutate("token-123");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("Access Denied");
    expect((result.current.error as any).status).toBe(403);
  });
});
