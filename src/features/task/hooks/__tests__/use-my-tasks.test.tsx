import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMyTasks } from "../use-my-tasks";
import { useParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

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

describe("useMyTasks hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    (useParams as jest.Mock).mockReturnValue({
      workspaceSlug: "test-workspace",
    });
  });

  it("fetches paginated my-tasks with explicit workspace ID and filter parameters", async () => {
    const mockTasksResponse = {
      tasks: [
        {
          id: "task-1",
          title: "My Task 1",
          status: "TODO",
          priority: "HIGH",
          dueDate: "2026-09-30T00:00:00.000Z",
          projectId: "proj-1",
          project: {
            id: "proj-1",
            name: "Alpha Project",
            slug: "alpha-project",
          },
          assignee: {
            id: "user-1",
            name: "Me",
            email: "me@example.com",
            image: null,
          },
          createdBy: {
            id: "user-2",
            name: "Boss",
            email: "boss@example.com",
            image: null,
          },
        },
      ],
      totalCount: 1,
      nextCursor: "next-cursor-id",
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTasksResponse),
    });

    const { wrapper } = createWrapper();
    const filters = {
      status: "TODO",
      priority: "HIGH",
      dueDate: "2026-09-30",
      pageSize: 10,
    };

    const { result } = renderHook(() => useMyTasks("workspace-123", filters), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/workspaces/workspace-123/my-tasks?status=TODO&priority=HIGH&dueDate=2026-09-30&pageSize=10"
    );

    expect(result.current.data?.pages[0]).toEqual(mockTasksResponse);
  });

  it("fetches my-tasks with overdue filter parameter", async () => {
    const mockTasksResponse = {
      tasks: [],
      totalCount: 0,
      nextCursor: null,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTasksResponse),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useMyTasks("workspace-123", { overdue: true }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/workspaces/workspace-123/my-tasks?overdue=true"
    );
  });

  it("uses workspaceSlug from route params when workspaceId is omitted", async () => {
    (useParams as jest.Mock).mockReturnValue({ workspaceSlug: "acme-corp" });

    const mockTasksResponse = {
      tasks: [],
      totalCount: 0,
      nextCursor: null,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockTasksResponse),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMyTasks({ status: "IN_PROGRESS" }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/workspaces/acme-corp/my-tasks?status=IN_PROGRESS"
    );
  });

  it("throws error when API response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: "Forbidden" }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMyTasks("workspace-123"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Forbidden");
  });
});
