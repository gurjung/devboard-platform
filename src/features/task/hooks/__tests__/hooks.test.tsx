import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTasks } from "../use-tasks";
import { useCreateTask } from "../use-create-task";
import { useUpdateTask } from "../use-update-task";
import { useDeleteTask } from "../use-delete-task";

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

describe("Task hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("useTasks", () => {
    it("fetches paginated tasks with filter parameters", async () => {
      const mockTasksResponse = {
        tasks: [
          {
            id: "task-1",
            title: "Task 1",
            status: "TODO",
            priority: "MEDIUM",
            dueDate: null,
            assignee: null,
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
        priority: "MEDIUM",
        assigneeId: "user-1",
        dueDate: "2026-08-25",
        pageSize: 10,
      };

      const { result } = renderHook(() => useTasks("project-1", filters), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects/project-1/tasks?status=TODO&priority=MEDIUM&assigneeId=user-1&dueDate=2026-08-25&pageSize=10"
      );

      expect(result.current.data?.pages[0]).toEqual(mockTasksResponse);
    });
  });

  describe("useCreateTask", () => {
    it("sends POST request to create task and invalidates task queries on success", async () => {
      const mockCreatedTask = { id: "task-2", title: "New Task" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCreatedTask),
      });

      const { queryClient, wrapper } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateTask("project-1"), {
        wrapper,
      });

      result.current.mutate({
        title: "New Task",
        status: "TODO",
        priority: "MEDIUM",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects/project-1/tasks",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "New Task",
            status: "TODO",
            priority: "MEDIUM",
          }),
        })
      );

      expect(result.current.data).toEqual(mockCreatedTask);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["tasks", "project-1"],
      });
    });
  });

  describe("useUpdateTask", () => {
    it("sends PATCH request to update task and updates query cache in place on success", async () => {
      const mockUpdatedTask = {
        id: "task-1",
        title: "Updated Task Name",
        description: "Updated Description",
        status: "IN_PROGRESS",
        priority: "HIGH",
        projectId: "project-1",
        assigneeId: "user-1",
        createdById: "user-2",
        dueDate: "2026-08-01T00:00:00.000Z",
        assignee: { id: "user-1", name: "John Doe" },
        createdBy: { id: "user-2", name: "Jane Smith" },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUpdatedTask),
      });

      const { queryClient, wrapper } = createWrapper();

      // Populate query cache
      const queryKey = ["tasks", "project-1", { status: "" }];
      queryClient.setQueryData(queryKey, {
        pages: [
          {
            tasks: [
              {
                id: "task-1",
                title: "Old Task Name",
                description: "Old Description",
                status: "TODO",
                priority: "MEDIUM",
                projectId: "project-1",
                assigneeId: "user-1",
                createdById: "user-2",
                dueDate: "2026-07-25T00:00:00.000Z",
                assignee: { id: "user-1", name: "John Doe" },
                createdBy: { id: "user-2", name: "Jane Smith" },
              },
            ],
            totalCount: 1,
            nextCursor: null,
          },
        ],
        pageParams: [null],
      });

      const { result } = renderHook(() => useUpdateTask("project-1"), {
        wrapper,
      });

      result.current.mutate({
        taskId: "task-1",
        data: { title: "Updated Task Name", status: "IN_PROGRESS" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects/project-1/tasks/task-1",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Updated Task Name",
            status: "IN_PROGRESS",
          }),
        })
      );

      // Verify the cache has been updated in place
      const cachedData = queryClient.getQueryData(queryKey) as any;
      expect(cachedData.pages[0].tasks[0].title).toBe("Updated Task Name");
      expect(cachedData.pages[0].tasks[0].status).toBe("IN_PROGRESS");
    });
  });

  describe("useDeleteTask", () => {
    it("sends DELETE request to delete task and invalidates task queries on success", async () => {
      const mockDeleteResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDeleteResponse),
      });

      const { queryClient, wrapper } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteTask("project-1"), {
        wrapper,
      });

      result.current.mutate("task-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects/project-1/tasks/task-1",
        expect.objectContaining({
          method: "DELETE",
        })
      );

      expect(result.current.data).toEqual(mockDeleteResponse);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["tasks", "project-1"],
      });
    });
  });
});
