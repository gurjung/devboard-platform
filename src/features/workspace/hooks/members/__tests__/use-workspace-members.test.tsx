import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWorkspaceMembers } from "../use-workspace-members";

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

describe("useWorkspaceMembers hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("should fetch workspace members list successfully", async () => {
    const mockMembersList = [
      {
        id: "member-1",
        role: "ADMIN",
        user: { name: "Alice", email: "alice@example.com" },
      },
      {
        id: "member-2",
        role: "MEMBER",
        user: { name: "Bob", email: "bob@example.com" },
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: mockMembersList }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useWorkspaceMembers("workspace-123"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/workspaces/workspace-123/members",
    );
    expect(result.current.data).toEqual(mockMembersList);
  });

  it("should throw error on fetch members failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: "Fetch members error" }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useWorkspaceMembers("workspace-123"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("Fetch members error");
  });
});
