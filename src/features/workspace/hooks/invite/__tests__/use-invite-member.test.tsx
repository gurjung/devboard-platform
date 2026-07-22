import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useInviteMember } from "../use-invite-member";

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

describe("useInviteMember hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("should send POST request and return invite response on success", async () => {
    const mockResponse = { success: true, inviteCode: "inv-123" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useInviteMember(), { wrapper });

    result.current.mutate({
      workspaceId: "workspace-123",
      data: { email: "user@example.com", role: "MEMBER" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/workspaces/workspace-123/invites",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com", role: "MEMBER" }),
      }),
    );

    expect(result.current.data).toEqual(mockResponse);
  });

  it("should throw custom error on invite member failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest
        .fn()
        .mockResolvedValue({
          message: "User already invited",
          error: "UserError",
        }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useInviteMember(), { wrapper });

    result.current.mutate({
      workspaceId: "workspace-123",
      data: { email: "user@example.com", role: "MEMBER" },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("User already invited");
    expect((result.current.error as any).status).toBe(400);
    expect((result.current.error as any).error).toBe("UserError");
  });
});
